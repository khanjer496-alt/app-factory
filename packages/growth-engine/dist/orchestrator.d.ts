import type { ContentIdea, ProductBrain, RenderRequest } from "./types";
import type { RendererProvider } from "./providers/renderers/interface";
export interface CampaignPlan {
    productId: string;
    selected: ContentIdea[];
    reviewRequired: ContentIdea[];
    autoEligible: ContentIdea[];
}
export declare function planCampaign(product: ProductBrain, ideas: ContentIdea[], maxItems?: number): CampaignPlan;
export declare function dispatchRender(request: RenderRequest, renderers: RendererProvider[]): Promise<import("./types").RenderResult>;
