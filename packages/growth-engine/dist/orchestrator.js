import { runContentQA } from "./qa";
import { rankIdeas } from "./scoring";
export function planCampaign(product, ideas, maxItems = 6) {
    const selected = rankIdeas(ideas).slice(0, maxItems);
    const reviewRequired = [];
    const autoEligible = [];
    for (const idea of selected) {
        const qa = runContentQA(product, idea);
        if (qa.autoPublishEligible)
            autoEligible.push(idea);
        else
            reviewRequired.push(idea);
    }
    return { productId: product.productId, selected, reviewRequired, autoEligible };
}
export async function dispatchRender(request, renderers) {
    const renderer = renderers.find((r) => r.supports(request.idea.format));
    if (!renderer)
        throw new Error(`No renderer configured for ${request.idea.format}`);
    return renderer.start(request);
}
//# sourceMappingURL=orchestrator.js.map