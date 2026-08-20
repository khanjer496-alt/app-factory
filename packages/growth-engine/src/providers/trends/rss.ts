import type { TrendProvider, TrendQuery } from "./interface";
import type { TrendSignal } from "../../types";

export interface RssTrendProviderOptions {
  name: string;
  feedUrl: (query: TrendQuery) => string;
  fetcher?: typeof fetch;
  defaultConfidence?: number;
}

/**
 * Generic RSS/Atom trend adapter. Useful for Google Trends RSS, news feeds,
 * industry feeds, or a normalized internal feed. XML parsing is intentionally
 * dependency-free and conservative for Cloudflare Workers compatibility.
 */
export class RssTrendProvider implements TrendProvider {
  readonly name: string;
  private readonly fetcher: typeof fetch;

  constructor(private readonly options: RssTrendProviderOptions) {
    this.name = options.name;
    this.fetcher = options.fetcher ?? fetch;
  }

  async collect(query: TrendQuery): Promise<TrendSignal[]> {
    const now = query.now ?? new Date();
    const res = await this.fetcher(this.options.feedUrl(query), {
      headers: { Accept: "application/rss+xml, application/atom+xml, text/xml;q=0.9, */*;q=0.5" },
    });
    if (!res.ok) throw new Error(`${this.name} RSS failed: ${res.status}`);
    const xml = await res.text();
    const items = extractItems(xml);
    return items.slice(0, query.limit ?? 100).map((item, index) => {
      const region = query.regions?.[0];
      const language = query.languages?.[0];
      const metadata: Record<string, unknown> = { description: decodeXml(item.description ?? "") };
      if (item.pubDate) metadata.publishedAt = item.pubDate;
      return {
        id: `${this.name}:${stableHash(item.link || item.title || String(index))}`,
        source: this.name,
        observedAt: now.toISOString(),
        ...(region ? { region } : {}),
        ...(language ? { language } : {}),
        text: decodeXml(item.title || item.description || "Untitled trend"),
        ...(item.link ? { url: item.link } : {}),
        keywords: tokenize(decodeXml(`${item.title ?? ""} ${item.description ?? ""}`)).slice(0, 12),
        confidence: this.options.defaultConfidence ?? 0.72,
        metadata,
      };
    });
  }
}

interface FeedItem { title: string | undefined; link: string | undefined; description: string | undefined; pubDate: string | undefined }

function extractItems(xml: string): FeedItem[] {
  const blocks = [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => m[2] ?? "");
  return blocks.map((block) => ({
    title: tag(block, "title"),
    link: atomLink(block) ?? tag(block, "link"),
    description: tag(block, "description") ?? tag(block, "summary") ?? tag(block, "content"),
    pubDate: tag(block, "pubDate") ?? tag(block, "published") ?? tag(block, "updated"),
  }));
}
function tag(xml: string, name: string): string | undefined {
  const m = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return m?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}
function atomLink(xml: string): string | undefined {
  return xml.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i)?.[1];
}
function decodeXml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
function tokenize(value: string): string[] {
  return [...new Set((value.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}_-]{2,}/gu) ?? []))];
}
function stableHash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}
