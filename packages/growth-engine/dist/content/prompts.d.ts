import type { PerformanceLearning, ProductBrain, ScoredTrendSignal } from "../types";
export declare function buildContentBrainPrompt(product: ProductBrain, trends: ScoredTrendSignal[], learnings: PerformanceLearning[], count: number): {
    system: string;
    prompt: string;
};
