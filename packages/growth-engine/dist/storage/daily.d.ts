import type { ContentIdea, PerformanceLearning, ProductBrain, QAResult, RenderResult, PublishResult } from "../types";
import type { D1DatabaseLike, D1PreparedStatementLike } from "./d1";
import type { SocialConnectionRecord } from "../runtime";
import type { ObservedContentPerformance } from "../learning/performance";
interface D1QueryStatementLike extends D1PreparedStatementLike {
    first?<T = Record<string, unknown>>(): Promise<T | null>;
    all?<T = Record<string, unknown>>(): Promise<{
        results?: T[];
    } | T[]>;
}
export interface D1QueryableDatabaseLike extends D1DatabaseLike {
    prepare(sql: string): D1QueryStatementLike;
}
export declare function loadGrowthProducts(db: D1QueryableDatabaseLike): Promise<ProductBrain[]>;
export declare function loadSocialConnections(db: D1QueryableDatabaseLike, productId: string): Promise<SocialConnectionRecord[]>;
export declare function startDailyGrowthRun(db: D1QueryableDatabaseLike, productId: string, scheduledFor?: string): Promise<{
    runId: string;
    startedAt: string;
}>;
export declare function finishDailyGrowthRun(db: D1QueryableDatabaseLike, runId: string, input: {
    status: "completed" | "partial" | "failed";
    trendRunId?: string;
    contentRunId?: string;
    selectedCount: number;
    renderedCount: number;
    reviewCount: number;
    publishCount: number;
    spendUsd: number;
    summary?: Record<string, unknown>;
    error?: string;
}): Promise<void>;
export declare function persistQAResult(db: D1QueryableDatabaseLike, productId: string, ideaId: string, qa: QAResult): Promise<void>;
export declare function persistApproval(db: D1QueryableDatabaseLike, productId: string, ideaId: string, renderId: string | undefined, reason: string): Promise<string>;
export declare function persistRenderResult(db: D1QueryableDatabaseLike, ideaId: string, result: RenderResult, existingRenderId?: string): Promise<string>;
export declare function persistPublication(db: D1QueryableDatabaseLike, input: {
    productId: string;
    ideaId: string;
    renderId?: string;
    platform: string;
    connectionId: string;
    result: PublishResult;
    scheduledAt?: string;
}): Promise<string>;
export declare function recordSpend(db: D1QueryableDatabaseLike, productId: string, runId: string, ideaId: string, category: string, provider: string, amountUsd: number): Promise<void>;
export declare function loadTodayUsage(db: D1QueryableDatabaseLike, productId: string): Promise<{
    publishes: number;
    spendUsd: number;
}>;
export declare function loadRecentPerformance(db: D1QueryableDatabaseLike, productId: string, limit?: number): Promise<ObservedContentPerformance[]>;
export declare function persistLearnings(db: D1QueryableDatabaseLike, productId: string, learnings: PerformanceLearning[]): Promise<void>;
export declare function loadLearnings(db: D1QueryableDatabaseLike, productId: string): Promise<PerformanceLearning[]>;
export declare function audit(db: D1QueryableDatabaseLike, productId: string, action: string, targetType: string, targetId: string, result: string, details?: Record<string, unknown>): Promise<void>;
import type { GrowthMetricObservation } from "../providers/metrics/interface";
export declare function persistMetricObservations(db: D1QueryableDatabaseLike, observations: GrowthMetricObservation[]): Promise<void>;
export interface ApprovalBundle {
    approvalId: string;
    product: ProductBrain;
    idea: ContentIdea;
    renderId?: string;
    mediaUrl?: string;
    status: string;
}
export declare function loadApprovalBundle(db: D1QueryableDatabaseLike, approvalId: string): Promise<ApprovalBundle | null>;
export declare function decideApproval(db: D1QueryableDatabaseLike, approvalId: string, decision: "approved" | "rejected", decidedBy: string, note?: string): Promise<void>;
export {};
