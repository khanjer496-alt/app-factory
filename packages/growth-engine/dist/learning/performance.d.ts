import type { ContentIdea, PerformanceLearning } from "../types";
export interface ObservedContentPerformance {
    idea: ContentIdea;
    views?: number;
    clicks?: number;
    signups?: number;
    paidConversions?: number;
    revenueUsd?: number;
}
/** Small deterministic memory builder. A richer LLM summary can be layered on later. */
export declare function derivePerformanceLearnings(rows: ObservedContentPerformance[]): PerformanceLearning[];
