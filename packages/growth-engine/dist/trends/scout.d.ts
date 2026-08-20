import type { ProductBrain, ScoredTrendSignal, TrendScoutReport, TrendSignal } from "../types";
import type { TrendProvider } from "../providers/trends/interface";
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
export declare class TrendScout {
    private readonly providers;
    constructor(providers: TrendProvider[]);
    run(product: ProductBrain, options?: TrendScoutOptions): Promise<TrendScoutReport>;
}
export declare function scoreTrend(signal: TrendSignal, product: ProductBrain, now?: Date): ScoredTrendSignal;
export declare function deriveProductKeywords(product: ProductBrain): string[];
