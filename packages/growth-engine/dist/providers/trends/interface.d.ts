import type { ProductBrain, TrendSignal } from "../../types";
export interface TrendQuery {
    productId: string;
    product?: ProductBrain;
    regions?: string[];
    languages?: string[];
    keywords?: string[];
    limit?: number;
    lookbackHours?: number;
    now?: Date;
}
export interface TrendProvider {
    readonly name: string;
    collect(query: TrendQuery): Promise<TrendSignal[]>;
}
