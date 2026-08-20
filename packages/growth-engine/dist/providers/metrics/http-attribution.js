/**
 * Pulls normalized conversion/revenue attribution from a product analytics endpoint.
 * Expected response: { metrics: GrowthMetricObservation[] } or GrowthMetricObservation[].
 */
export class HttpAttributionMetricsProvider {
    options;
    name;
    fetcher;
    constructor(options) {
        this.options = options;
        this.name = options.name ?? "http_attribution";
        this.fetcher = options.fetcher ?? fetch;
    }
    async collect(product) {
        const url = typeof this.options.url === "function" ? this.options.url(product) : this.options.url;
        const headers = { accept: "application/json" };
        if (this.options.bearerToken)
            headers.authorization = `Bearer ${this.options.bearerToken}`;
        const res = await this.fetcher(url, { headers });
        if (!res.ok)
            throw new Error(`${this.name} metrics failed: ${res.status}`);
        const body = (await res.json());
        const rows = Array.isArray(body) ? body : body.metrics ?? [];
        return rows.filter((row) => Boolean(row?.publicationId && row?.observedAt)).slice(0, 5000);
    }
}
//# sourceMappingURL=http-attribution.js.map