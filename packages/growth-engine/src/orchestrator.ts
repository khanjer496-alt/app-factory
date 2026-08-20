import type { ContentIdea, ProductBrain, RenderRequest } from "./types";
import { runContentQA } from "./qa";
import { rankIdeas } from "./scoring";
import type { RendererProvider } from "./providers/renderers/interface";

export interface CampaignPlan {
  productId: string;
  selected: ContentIdea[];
  reviewRequired: ContentIdea[];
  autoEligible: ContentIdea[];
}

export function planCampaign(product: ProductBrain, ideas: ContentIdea[], maxItems = 6): CampaignPlan {
  const selected = rankIdeas(ideas).slice(0, maxItems);
  const reviewRequired: ContentIdea[] = [];
  const autoEligible: ContentIdea[] = [];

  for (const idea of selected) {
    const qa = runContentQA(product, idea);
    if (qa.autoPublishEligible) autoEligible.push(idea);
    else reviewRequired.push(idea);
  }
  return { productId: product.productId, selected, reviewRequired, autoEligible };
}

export async function dispatchRender(request: RenderRequest, renderers: RendererProvider[]) {
  const renderer = renderers.find((r) => r.supports(request.idea.format));
  if (!renderer) throw new Error(`No renderer configured for ${request.idea.format}`);
  return renderer.start(request);
}
