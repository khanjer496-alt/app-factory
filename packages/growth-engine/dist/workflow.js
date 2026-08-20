import { runGrowthDiscovery } from "./pipeline";
import { persistContentBrainReport, persistTrendScoutReport } from "./storage/d1";
/**
 * Durable-step-friendly discovery cycle. In a Cloudflare Workflow, call this in
 * a step, then pass selected ideas into QA/render/publish steps.
 */
export async function runAndPersistDiscoveryCycle(db, product, trendProviders, options = {}) {
    const result = await runGrowthDiscovery(product, trendProviders, options);
    await persistTrendScoutReport(db, result.trends);
    await persistContentBrainReport(db, result.content);
    return result;
}
//# sourceMappingURL=workflow.js.map