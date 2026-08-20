import type { TrendProvider, TrendQuery } from "./interface";
import type { TrendSignal } from "../../types";
export interface YouTubeTrendProviderOptions {
    apiKey: string;
    fetcher?: typeof fetch;
    maxQueries?: number;
    maxResultsPerQuery?: number;
}
/**
 * Official YouTube Data API trend signal provider.
 * Searches fresh videos around product keywords and enriches them with statistics.
 */
export declare class YouTubeTrendProvider implements TrendProvider {
    private readonly options;
    readonly name = "youtube";
    private readonly fetcher;
    private readonly maxQueries;
    private readonly maxResults;
    constructor(options: YouTubeTrendProviderOptions);
    collect(query: TrendQuery): Promise<TrendSignal[]>;
    private buildQueries;
}
