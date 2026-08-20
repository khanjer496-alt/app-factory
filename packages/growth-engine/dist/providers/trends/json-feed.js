/**
 * Adapter for any partner/search/trend service that can expose normalized JSON.
 * Expected body: { signals: TrendSignal[] } or TrendSignal[].
 */
export class JsonTrendFeedProvider {
    options;
    name;
    fetcher;
    constructor(options) {
        this.options = options;
        this.name = options.name;
        this.fetcher = options.fetcher ?? fetch;
    }
    async collect(query) {
        const init = this.options.headers ? { headers: this.options.headers } : {};
        const res = await this.fetcher(this.options.url(query), init);
        if (!res.ok)
            throw new Error(`${this.name} JSON feed failed: ${res.status}`);
        const body = (await res.json());
        const signals = Array.isArray(body) ? body : body.signals ?? [];
        return signals.slice(0, query.limit ?? 100);
    }
}
//# sourceMappingURL=json-feed.js.map