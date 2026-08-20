import type { ProductBrain } from "./types";
import type { TrendProvider } from "./providers/trends/interface";
import type { D1DatabaseLike } from "./storage/d1";
import type { TrendScoutOptions } from "./trends/scout";
import type { ContentBrainOptions } from "./content/brain";
import { runGrowthDiscovery } from "./pipeline";
import { persistContentBrainReport, persistTrendScoutReport } from "./storage/d1";

/**
 * Durable-step-friendly discovery cycle. In a Cloudflare Workflow, call this in
 * a step, then pass selected ideas into QA/render/publish steps.
 */
export async function runAndPersistDiscoveryCycle(
  db: D1DatabaseLike,
  product: ProductBrain,
  trendProviders: TrendProvider[],
  options: { trend?: TrendScoutOptions; content?: ContentBrainOptions } = {},
) {
  const result = await runGrowthDiscovery(product, trendProviders, options);
  await persistTrendScoutReport(db, result.trends);
  await persistContentBrainReport(db, result.content);
  return result;
}
