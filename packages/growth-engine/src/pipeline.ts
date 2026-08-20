import type { ProductBrain, TrendScoutReport, ContentBrainReport } from "./types";
import type { TrendProvider } from "./providers/trends/interface";
import { TrendScout, type TrendScoutOptions } from "./trends/scout";
import { ContentBrain, type ContentBrainOptions } from "./content/brain";

export interface GrowthDiscoveryResult {
  trends: TrendScoutReport;
  content: ContentBrainReport;
}

/** One-call discovery pipeline used by a Cloudflare Workflow. */
export async function runGrowthDiscovery(
  product: ProductBrain,
  trendProviders: TrendProvider[],
  options: { trend?: TrendScoutOptions; content?: ContentBrainOptions } = {},
): Promise<GrowthDiscoveryResult> {
  const trends = await new TrendScout(trendProviders).run(product, options.trend);
  const content = await new ContentBrain().generate(product, trends.selected, options.content);
  return { trends, content };
}
