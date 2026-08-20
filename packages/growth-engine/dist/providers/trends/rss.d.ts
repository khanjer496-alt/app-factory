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
export declare class RssTrendProvider implements TrendProvider {
    private readonly options;
    readonly name: string;
    private readonly fetcher;
    constructor(options: RssTrendProviderOptions);
    collect(query: TrendQuery): Promise<TrendSignal[]>;
}
