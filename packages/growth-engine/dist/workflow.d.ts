import type { ProductBrain } from "./types";
import type { TrendProvider } from "./providers/trends/interface";
import type { D1DatabaseLike } from "./storage/d1";
import type { TrendScoutOptions } from "./trends/scout";
import type { ContentBrainOptions } from "./content/brain";
/**
 * Durable-step-friendly discovery cycle. In a Cloudflare Workflow, call this in
 * a step, then pass selected ideas into QA/render/publish steps.
 */
export declare function runAndPersistDiscoveryCycle(db: D1DatabaseLike, product: ProductBrain, trendProviders: TrendProvider[], options?: {
    trend?: TrendScoutOptions;
    content?: ContentBrainOptions;
}): Promise<import("./pipeline").GrowthDiscoveryResult>;
