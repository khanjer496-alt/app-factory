import type { ProductBrain } from "../../types";
import type { GrowthMetricObservation, MetricsProvider } from "./interface";
export interface HttpAttributionMetricsOptions {
    name?: string;
    url: string | ((product: ProductBrain) => string);
    bearerToken?: string;
    fetcher?: typeof fetch;
}
/**
 * Pulls normalized conversion/revenue attribution from a product analytics endpoint.
 * Expected response: { metrics: GrowthMetricObservation[] } or GrowthMetricObservation[].
 */
export declare class HttpAttributionMetricsProvider implements MetricsProvider {
    private readonly options;
    readonly name: string;
    private readonly fetcher;
    constructor(options: HttpAttributionMetricsOptions);
    collect(product: ProductBrain): Promise<GrowthMetricObservation[]>;
}
