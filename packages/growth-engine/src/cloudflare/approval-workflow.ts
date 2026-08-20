import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { createCloudflareGrowthRuntime, type GrowthWorkflowEnv } from "./runtime";
import { compatiblePlatforms, findPublisher, publishText } from "../daily";
import {
  audit, decideApproval, loadApprovalBundle, loadSocialConnections, loadTodayUsage, persistPublication,
  type D1QueryableDatabaseLike,
} from "../storage/daily";

export interface ApprovalWorkflowPayload {
  approvalId: string;
  approvedBy: string;
  note?: string;
}

/** Publish a previously reviewed item after a human approval event. */
export class ApprovalPublishWorkflow extends WorkflowEntrypoint<GrowthWorkflowEnv, ApprovalWorkflowPayload> {
  async run(event: WorkflowEvent<ApprovalWorkflowPayload>, step: WorkflowStep) {
    const db = this.env.GROWTH_DB as D1QueryableDatabaseLike;
    const runtime = createCloudflareGrowthRuntime(this.env);
    const payload = event.payload;
    if (!payload?.approvalId || !payload?.approvedBy) throw new Error("approvalId and approvedBy are required");

    const bundle = await step.do("load approval", () => loadApprovalBundle(db, payload.approvalId));
    if (!bundle) throw new Error("Approval not found");
    if (bundle.status !== "pending") return { status: "ignored", reason: `Approval is ${bundle.status}` };

    await step.do("mark approved", () => decideApproval(db, payload.approvalId, "approved", payload.approvedBy, payload.note));
    const usageAndConnections = await step.do("load publish capacity", async () => ({
      usage: await loadTodayUsage(db, bundle.product.productId),
      connections: await loadSocialConnections(db, bundle.product.productId),
    }));
    const remaining = Math.max(0, bundle.product.autonomy.maxPublishesPerDay - usageAndConnections.usage.publishes);
    if (remaining <= 0) {
      await audit(db, bundle.product.productId, "approved_publish", "content_idea", bundle.idea.id, "blocked", { reason: "daily publish cap reached" });
      return { status: "blocked", reason: "Daily publish cap reached" };
    }

    if (bundle.idea.format !== "text_post" && !bundle.mediaUrl) {
      await audit(db, bundle.product.productId, "approved_publish", "content_idea", bundle.idea.id, "blocked", { reason: "approved item has no completed media URL" });
      return { status: "blocked", reason: "Approved item has no completed media URL" };
    }

    const allowed = new Set(compatiblePlatforms(bundle.idea));
    const connections = usageAndConnections.connections.filter((c) => allowed.has(c.platform)).slice(0, remaining);
    const publishers = await runtime.publishers(bundle.product);
    const results = [];
    for (const connection of connections) {
      const publisher = findPublisher(connection.platform, publishers);
      if (!publisher) continue;
      const result = await step.do(`publish:${connection.platform}:${connection.id}`, { retries: { limit: 3, delay: "30 seconds", backoff: "exponential" }, timeout: "5 minutes" }, async () => {
        const credential = await runtime.credentialVault.resolve(connection);
        return publisher.publish({
          contentId: bundle.idea.id,
          productId: bundle.product.productId,
          platform: connection.platform,
          connectionId: connection.id,
          ...(bundle.mediaUrl ? { mediaUrl: bundle.mediaUrl } : {}),
          text: publishText(bundle.idea),
          title: bundle.idea.hook.slice(0, 120),
          metadata: { humanApproved: true, approvedBy: payload.approvedBy },
        }, credential);
      });
      await step.do(`persist:${connection.platform}:${connection.id}`, async () => {
        await persistPublication(db, {
          productId: bundle.product.productId,
          ideaId: bundle.idea.id,
          ...(bundle.renderId ? { renderId: bundle.renderId } : {}),
          platform: connection.platform,
          connectionId: connection.id,
          result,
        });
        await audit(db, bundle.product.productId, "approved_publish", "content_idea", bundle.idea.id, result.status, { platform: connection.platform, approvedBy: payload.approvedBy });
      });
      results.push({ platform: connection.platform, status: result.status, error: result.error });
    }
    return { status: "completed", approvalId: payload.approvalId, results };
  }
}
