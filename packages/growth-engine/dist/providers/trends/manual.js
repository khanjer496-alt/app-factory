/** Safe bootstrap source: operator/product team can seed trend URLs or observations. */
export class ManualTrendProvider {
    signals;
    name = "manual";
    constructor(signals) {
        this.signals = signals;
    }
    async collect(query) {
        const langs = new Set(query.languages ?? []);
        const regions = new Set(query.regions ?? []);
        return this.signals
            .filter((s) => !langs.size || !s.language || langs.has(s.language))
            .filter((s) => !regions.size || !s.region || regions.has(s.region))
            .slice(0, query.limit ?? 100);
    }
}
//# sourceMappingURL=manual.js.map