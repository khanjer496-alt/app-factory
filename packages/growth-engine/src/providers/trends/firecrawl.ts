import type { TrendProvider, TrendQuery } from "./interface";
import type { TrendSignal } from "../../types";

export interface FirecrawlTrendProviderOptions {
  apiKey: string;
  baseUrl?: string;
  fetcher?: typeof fetch;
  maxSignals?: number;
  country?: string;
  location?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
}

interface FirecrawlSearchItem {
  title?: string;
  description?: string;
  url?: string;
  markdown?: string;
  metadata?: {
    title?: string;
    description?: string;
    sourceURL?: string;
    url?: string;
    statusCode?: number;
  };
}

interface FirecrawlSearchResponse {
  success?: boolean;
  data?: { web?: FirecrawlSearchItem[] };
  warning?: string;
  creditsUsed?: number;
}

/**
 * Optional public-web discovery source backed by Firecrawl v2 Search.
 * This is discovery data, not authoritative trend-volume data. The TrendScout
 * should combine it with direct-platform metrics when available.
 */
export class FirecrawlTrendProvider implements TrendProvider {
  readonly name = "firecrawl_web";
  private readonly fetcher: typeof fetch;

  constructor(private readonly options: FirecrawlTrendProviderOptions) {
    this.fetcher = options.fetcher ?? fetch;
  }

  async collect(query: TrendQuery): Promise<TrendSignal[]> {
    const now = query.now ?? new Date();
    const limit = Math.min(query.limit ?? this.options.maxSignals ?? 20, this.options.maxSignals ?? 20, 50);
    const searchQuery = buildQuery(query);
    if (!searchQuery) return [];

    const response = await this.fetcher(`${(this.options.baseUrl ?? "https://api.firecrawl.dev").replace(/\/$/, "")}/v2/search`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.options.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: searchQuery,
        limit,
        sources: ["web"],
        ...(this.options.country ? { country: this.options.country } : query.regions?.[0] ? { country: query.regions[0] } : {}),
        ...(this.options.location ? { location: this.options.location } : {}),
        ...(this.options.includeDomains?.length ? { includeDomains: this.options.includeDomains } : {}),
        ...(this.options.excludeDomains?.length ? { excludeDomains: this.options.excludeDomains } : {}),
        timeout: 30_000,
        ignoreInvalidURLs: true,
      }),
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 800);
      throw new Error(`Firecrawl search ${response.status}: ${detail}`);
    }

    const payload = (await response.json()) as FirecrawlSearchResponse;
    const items = payload.data?.web ?? [];

    return items.slice(0, limit).flatMap((item, index) => {
      const text = [item.title ?? item.metadata?.title, item.description ?? item.metadata?.description]
        .filter(Boolean)
        .join(" — ")
        .trim();
      const url = item.url ?? item.metadata?.url ?? item.metadata?.sourceURL;
      if (!text || !url) return [];

      return [{
        id: `firecrawl:${stableHash(`${url}:${text}:${index}`)}`,
        source: this.name,
        observedAt: now.toISOString(),
        ...(query.regions?.[0] ? { region: query.regions[0] } : {}),
        ...(query.languages?.[0] ? { language: query.languages[0] } : {}),
        platform: "web",
        text,
        url,
        keywords: tokenize(text).slice(0, 12),
        confidence: 0.58,
        metadata: {
          discovery: "firecrawl_search",
          creditsUsed: payload.creditsUsed,
          warning: payload.warning,
        },
      } satisfies TrendSignal];
    });
  }
}

function buildQuery(query: TrendQuery): string {
  const product = query.product;
  const terms = [
    ...(query.keywords ?? []).slice(0, 8),
    ...(product?.contentPillars ?? []).slice(0, 4),
    ...(product?.audiences ?? []).slice(0, 3),
  ].map((value) => clean(value)).filter(Boolean);
  return [...new Set(terms)].join(" ").slice(0, 500);
}

function clean(value: string): string {
  return String(value ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(value: string): string[] {
  return [...new Set(value.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}_-]{2,}/gu) ?? [])];
}

function stableHash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}
