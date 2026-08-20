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
/**
 * Optional public-web discovery source backed by Firecrawl v2 Search.
 * This is discovery data, not authoritative trend-volume data. The TrendScout
 * should combine it with direct-platform metrics when available.
 */
export declare class FirecrawlTrendProvider implements TrendProvider {
    private readonly options;
    readonly name = "firecrawl_web";
    private readonly fetcher;
    constructor(options: FirecrawlTrendProviderOptions);
    collect(query: TrendQuery): Promise<TrendSignal[]>;
}
