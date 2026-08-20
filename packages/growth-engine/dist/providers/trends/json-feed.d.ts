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
export declare class JsonTrendFeedProvider implements TrendProvider {
    private readonly options;
    readonly name: string;
    private readonly fetcher;
    constructor(options: JsonTrendFeedOptions);
    collect(query: TrendQuery): Promise<TrendSignal[]>;
}
