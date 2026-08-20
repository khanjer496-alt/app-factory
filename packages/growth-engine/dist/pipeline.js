import { TrendScout } from "./trends/scout";
import { ContentBrain } from "./content/brain";
/** One-call discovery pipeline used by a Cloudflare Workflow. */
export async function runGrowthDiscovery(product, trendProviders, options = {}) {
    const trends = await new TrendScout(trendProviders).run(product, options.trend);
    const content = await new ContentBrain().generate(product, trends.selected, options.content);
    return { trends, content };
}
//# sourceMappingURL=pipeline.js.map