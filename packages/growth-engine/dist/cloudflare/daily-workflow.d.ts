import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { type GrowthWorkflowEnv } from "./runtime";
export interface DailyWorkflowPayload {
    productId?: string;
    maxIdeasPerProduct?: number;
}
interface ProductRunSummary {
    productId: string;
    status: "completed" | "partial" | "failed";
    selected: number;
    rendered: number;
    reviews: number;
    publications: number;
    spendUsd: number;
    error?: string;
}
/**
 * Scheduled Cloudflare Workflow. Configure `schedules` on the Workflow binding.
 * It intentionally keeps human approvals out-of-band: review-required ideas are
 * written to `content_approvals`; an approval endpoint can launch a publish-only
 * workflow later without blocking the entire daily run.
 */
export declare class DailyGrowthWorkflow extends WorkflowEntrypoint<GrowthWorkflowEnv, DailyWorkflowPayload> {
    run(event: WorkflowEvent<DailyWorkflowPayload>, step: WorkflowStep): Promise<{
        schedule: {
            cron?: string;
            scheduledTime?: number;
        } | null;
        productCount: number;
        summaries: ProductRunSummary[];
    }>;
    private runProduct;
}
export {};
