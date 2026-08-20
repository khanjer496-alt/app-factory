import type { ContentBrainReport, ContentExperiment, ContentIdea, PerformanceLearning, ProductBrain, ScoredTrendSignal } from "../types";
import type { TextModel } from "./model";
export interface ContentBrainOptions {
    ideaCount?: number;
    experimentCount?: number;
    variantsPerExperiment?: number;
    learnings?: PerformanceLearning[];
    model?: TextModel;
    minScore?: number;
}
export declare class ContentBrain {
    generate(product: ProductBrain, trends: ScoredTrendSignal[], options?: ContentBrainOptions): Promise<ContentBrainReport>;
    private parseModelIdeas;
}
export declare function createExperiments(product: ProductBrain, ideas: ContentIdea[], experimentCount: number, variantsPerExperiment: number): ContentExperiment[];
