import type { ContentIdea } from "./types";
export interface IdeaSignals {
    productRelevance: number;
    trendVelocity: number;
    proofStrength: number;
    conversionFit: number;
    novelty: number;
    estimatedCost: number;
    riskPenalty: number;
}
export declare function scoreIdea(s: IdeaSignals): number;
export declare function rankIdeas(ideas: ContentIdea[]): ContentIdea[];
