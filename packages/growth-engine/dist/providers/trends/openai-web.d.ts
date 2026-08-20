import type { TrendProvider, TrendQuery } from "./interface";
import type { TrendSignal } from "../../types";
export interface OpenAIWebTrendProviderOptions {
    apiKey: string;
    model: string;
    baseUrl?: string;
    fetcher?: typeof fetch;
    maxSignals?: number;
}
/**
 * Optional broad-web Trend Scout source using OpenAI Responses + web_search.
 * Treat as discovery, not ground-truth volume data. Direct platform/provider
 * metrics should receive higher confidence when available.
 */
export declare class OpenAIWebTrendProvider implements TrendProvider {
    private readonly options;
    readonly name = "openai_web_search";
    private readonly fetcher;
    constructor(options: OpenAIWebTrendProviderOptions);
    collect(query: TrendQuery): Promise<TrendSignal[]>;
}
