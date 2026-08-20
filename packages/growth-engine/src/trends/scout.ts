import type { ProductBrain, ScoredTrendSignal, TrendScoutReport, TrendSignal } from "../types";
import type { TrendProvider, TrendQuery } from "../providers/trends/interface";

export interface TrendScoutOptions {
  regions?: string[];
  languages?: string[];
  keywords?: string[];
  lookbackHours?: number;
  perProviderLimit?: number;
  maxSelected?: number;
  maxPerSource?: number;
  minTrendScore?: number;
  now?: Date;
}

export class TrendScout {
  constructor(private readonly providers: TrendProvider[]) {}

  async run(product: ProductBrain, options: TrendScoutOptions = {}): Promise<TrendScoutReport> {
    const now = options.now ?? new Date();
    const runId = `trendrun_${cryptoId()}`;
    const startedAt = now.toISOString();
    const providerReports: TrendScoutReport["providers"] = [];
    const raw: TrendSignal[] = [];

    const query: TrendQuery = {
      productId: product.productId,
      product,
      ...(options.regions ? { regions: options.regions } : {}),
      languages: options.languages ?? product.languages,
      keywords: options.keywords ?? deriveProductKeywords(product),
      limit: options.perProviderLimit ?? 60,
      lookbackHours: options.lookbackHours ?? 72,
      now,
    };

    const results = await Promise.allSettled(this.providers.map(async (provider) => ({
      provider,
      signals: await provider.collect(query),
    })));

    results.forEach((result, index) => {
      const provider = this.providers[index];
      if (!provider) return;
      if (result.status === "fulfilled") {
        raw.push(...result.value.signals);
        providerReports.push({ name: provider.name, collected: result.value.signals.length });
      } else {
        providerReports.push({ name: provider.name, collected: 0, error: toErrorMessage(result.reason) });
      }
    });

    const sanitized = raw.map(sanitizeSignal).filter((s): s is TrendSignal => Boolean(s));
    const deduped = dedupeSignals(sanitized);
    const ranked = deduped
      .map((signal) => scoreTrend(signal, product, now))
      .filter((signal) => signal.trendScore >= (options.minTrendScore ?? 35))
      .sort((a, b) => b.trendScore - a.trendScore || b.confidence - a.confidence);
    const scored = diversifyBySource(ranked, options.maxSelected ?? 30, options.maxPerSource ?? 12);

    return {
      productId: product.productId,
      runId,
      startedAt,
      completedAt: new Date().toISOString(),
      providers: providerReports,
      rawCount: raw.length,
      dedupedCount: deduped.length,
      selected: scored,
    };
  }
}

export function scoreTrend(signal: TrendSignal, product: ProductBrain, now = new Date()): ScoredTrendSignal {
  const relevance = productRelevance(signal, product);
  const freshness = freshnessScore(signal, now);
  const velocity = normalizeMagnitude(signal.velocity ?? 0, 100_000);
  const volume = normalizeMagnitude(signal.volume ?? 0, 1_000_000);
  const engagement = Math.min(1, Math.max(0, (signal.engagementRate ?? 0) / 0.08));
  const sourceConfidence = clamp(signal.confidence);
  const trendScore = Math.round(100 * clamp(
    relevance * 0.36 +
    freshness * 0.18 +
    velocity * 0.18 +
    volume * 0.10 +
    engagement * 0.06 +
    sourceConfidence * 0.12,
  ));

  const reasons: string[] = [];
  if (relevance >= 0.65) reasons.push("strong product/audience relevance");
  if (freshness >= 0.8) reasons.push("fresh signal");
  if (velocity >= 0.65) reasons.push("high observed velocity");
  if (volume >= 0.65) reasons.push("large observed volume");
  if (engagement >= 0.65) reasons.push("strong engagement");
  if (!reasons.length) reasons.push("moderate multi-signal fit");

  return { ...signal, trendScore, productRelevance: relevance, freshness, reasons };
}

export function deriveProductKeywords(product: ProductBrain): string[] {
  return unique([
    product.name,
    product.oneLiner,
    ...product.audiences,
    ...product.positioning,
    ...product.contentPillars,
  ].flatMap(tokenize).filter((x) => x.length > 2)).slice(0, 30);
}

function productRelevance(signal: TrendSignal, product: ProductBrain): number {
  const trendTokens = new Set(tokenize([signal.text, ...signal.keywords, ...(signal.relatedTerms ?? [])].join(" ")));
  const weightedGroups: Array<[string[], number]> = [
    [[product.name, product.oneLiner], 1.0],
    [product.contentPillars, 0.95],
    [product.positioning, 0.9],
    [product.audiences, 0.72],
  ];
  let hitWeight = 0;
  let totalWeight = 0;
  for (const [texts, weight] of weightedGroups) {
    const tokens = unique(texts.flatMap(tokenize));
    for (const token of tokens) {
      totalWeight += weight;
      if (trendTokens.has(token)) hitWeight += weight;
    }
  }
  const lexical = totalWeight ? hitWeight / Math.min(totalWeight, 10) : 0;
  const explicitKeywordHits = signal.keywords.filter((k) => productText(product).includes(k.toLowerCase())).length;
  return clamp(Math.max(lexical * 1.7, explicitKeywordHits ? 0.45 + Math.min(0.4, explicitKeywordHits * 0.1) : 0));
}

function freshnessScore(signal: TrendSignal, now: Date): number {
  const t = new Date(signal.observedAt).getTime();
  if (!Number.isFinite(t)) return 0.5;
  const ageHours = Math.max(0, (now.getTime() - t) / 3600_000);
  return Math.exp(-ageHours / 48);
}
function normalizeMagnitude(value: number, reference: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return clamp(Math.log10(1 + value) / Math.log10(1 + reference));
}
function sanitizeSignal(signal: TrendSignal): TrendSignal | null {
  const text = cleanText(signal.text).slice(0, 700);
  if (!text) return null;
  const url = safeHttpUrl(signal.url);
  const keywords = unique(signal.keywords.map(cleanText).filter(Boolean)).slice(0, 24).map((x) => x.slice(0, 100));
  const relatedTerms = signal.relatedTerms
    ? unique(signal.relatedTerms.map(cleanText).filter(Boolean)).slice(0, 20).map((x) => x.slice(0, 120))
    : undefined;
  const cleaned: TrendSignal = { ...signal, text, keywords };
  if (url) cleaned.url = url;
  else delete cleaned.url;
  if (relatedTerms) cleaned.relatedTerms = relatedTerms;
  else delete cleaned.relatedTerms;
  return cleaned;
}
function cleanText(value: string): string {
  return String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
}
function safeHttpUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : undefined;
  } catch { return undefined; }
}

function dedupeSignals(signals: TrendSignal[]): TrendSignal[] {
  const byKey = new Map<string, TrendSignal>();
  for (const signal of signals) {
    const key = normalize(signal.text);
    const prior = byKey.get(key);
    if (!prior || signal.confidence > prior.confidence || (signal.volume ?? 0) > (prior.volume ?? 0)) {
      byKey.set(key, signal);
    }
  }
  return [...byKey.values()];
}

function diversifyBySource(signals: ScoredTrendSignal[], maxSelected: number, maxPerSource: number): ScoredTrendSignal[] {
  const counts = new Map<string, number>();
  const selected: ScoredTrendSignal[] = [];
  for (const signal of signals) {
    const count = counts.get(signal.source) ?? 0;
    if (count >= maxPerSource) continue;
    selected.push(signal);
    counts.set(signal.source, count + 1);
    if (selected.length >= maxSelected) break;
  }
  return selected;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
function tokenize(value: string): string[] {
  return value.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}_-]{2,}/gu) ?? [];
}
function productText(product: ProductBrain): string {
  return [product.name, product.oneLiner, ...product.audiences, ...product.positioning, ...product.contentPillars]
    .join(" ").toLowerCase();
}
function unique<T>(values: T[]): T[] { return [...new Set(values)]; }
function clamp(value: number): number { return Math.max(0, Math.min(1, value)); }
function cryptoId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}
function toErrorMessage(value: unknown): string { return value instanceof Error ? value.message : String(value); }
