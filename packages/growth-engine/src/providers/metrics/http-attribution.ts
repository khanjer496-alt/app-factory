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
export class HttpAttributionMetricsProvider implements MetricsProvider {
  readonly name: string;
  private readonly fetcher: typeof fetch;
  constructor(private readonly options: HttpAttributionMetricsOptions) {
    this.name = options.name ?? "http_attribution";
    this.fetcher = options.fetcher ?? fetch;
  }
  async collect(product: ProductBrain): Promise<GrowthMetricObservation[]> {
    const url = typeof this.options.url === "function" ? this.options.url(product) : this.options.url;
    const headers: Record<string, string> = { accept: "application/json" };
    if (this.options.bearerToken) headers.authorization = `Bearer ${this.options.bearerToken}`;
    const res = await this.fetcher(url, { headers });
    if (!res.ok) throw new Error(`${this.name} metrics failed: ${res.status}`);
    const body = (await res.json()) as GrowthMetricObservation[] | { metrics?: GrowthMetricObservation[] };
    const rows = Array.isArray(body) ? body : body.metrics ?? [];
    return rows.filter((row) => Boolean(row?.publicationId && row?.observedAt)).slice(0, 5000);
  }
}
