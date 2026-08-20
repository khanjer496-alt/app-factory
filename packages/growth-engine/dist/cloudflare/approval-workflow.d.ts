import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { type GrowthWorkflowEnv } from "./runtime";
export interface ApprovalWorkflowPayload {
    approvalId: string;
    approvedBy: string;
    note?: string;
}
/** Publish a previously reviewed item after a human approval event. */
export declare class ApprovalPublishWorkflow extends WorkflowEntrypoint<GrowthWorkflowEnv, ApprovalWorkflowPayload> {
    run(event: WorkflowEvent<ApprovalWorkflowPayload>, step: WorkflowStep): Promise<{
        status: string;
        reason: string;
        approvalId?: never;
        results?: never;
    } | {
        status: string;
        approvalId: string;
        results: {
            platform: import("..").Platform;
            status: "queued" | "failed" | "published" | "needs_review";
            error: string | undefined;
        }[];
        reason?: never;
    }>;
}
