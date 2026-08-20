import type { TrendProvider, TrendQuery } from "./interface";
import type { TrendSignal } from "../../types";
/** Safe bootstrap source: operator/product team can seed trend URLs or observations. */
export declare class ManualTrendProvider implements TrendProvider {
    private readonly signals;
    readonly name = "manual";
    constructor(signals: TrendSignal[]);
    collect(query: TrendQuery): Promise<TrendSignal[]>;
}
