import type { ProductBrain, TrendScoutReport, ContentBrainReport } from "./types";
import type { TrendProvider } from "./providers/trends/interface";
import { type TrendScoutOptions } from "./trends/scout";
import { type ContentBrainOptions } from "./content/brain";
export interface GrowthDiscoveryResult {
    trends: TrendScoutReport;
    content: ContentBrainReport;
}
/** One-call discovery pipeline used by a Cloudflare Workflow. */
export declare function runGrowthDiscovery(product: ProductBrain, trendProviders: TrendProvider[], options?: {
    trend?: TrendScoutOptions;
    content?: ContentBrainOptions;
}): Promise<GrowthDiscoveryResult>;
