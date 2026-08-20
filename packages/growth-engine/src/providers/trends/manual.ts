import type { TrendProvider, TrendQuery } from "./interface";
import type { TrendSignal } from "../../types";

/** Safe bootstrap source: operator/product team can seed trend URLs or observations. */
export class ManualTrendProvider implements TrendProvider {
  readonly name = "manual";
  constructor(private readonly signals: TrendSignal[]) {}
  async collect(query: TrendQuery): Promise<TrendSignal[]> {
    const langs = new Set(query.languages ?? []);
    const regions = new Set(query.regions ?? []);
    return this.signals
      .filter((s) => !langs.size || !s.language || langs.has(s.language))
      .filter((s) => !regions.size || !s.region || regions.has(s.region))
      .slice(0, query.limit ?? 100);
  }
}
