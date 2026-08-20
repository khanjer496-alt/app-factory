import type { TrendProvider, TrendQuery } from "./interface";
import type { TrendSignal } from "../../types";

export interface JsonTrendFeedOptions {
  name: string;
  url: (query: TrendQuery) => string;
  fetcher?: typeof fetch;
  headers?: Record<string, string>;
}

/**
 * Adapter for any partner/search/trend service that can expose normalized JSON.
 * Expected body: { signals: TrendSignal[] } or TrendSignal[].
 */
export class JsonTrendFeedProvider implements TrendProvider {
  readonly name: string;
  private readonly fetcher: typeof fetch;
  constructor(private readonly options: JsonTrendFeedOptions) {
    this.name = options.name;
    this.fetcher = options.fetcher ?? fetch;
  }
  async collect(query: TrendQuery): Promise<TrendSignal[]> {
    const init: RequestInit = this.options.headers ? { headers: this.options.headers } : {};
    const res = await this.fetcher(this.options.url(query), init);
    if (!res.ok) throw new Error(`${this.name} JSON feed failed: ${res.status}`);
    const body = (await res.json()) as TrendSignal[] | { signals?: TrendSignal[] };
    const signals = Array.isArray(body) ? body : body.signals ?? [];
    return signals.slice(0, query.limit ?? 100);
  }
}
