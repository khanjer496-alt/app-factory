import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from "cloudflare:workers";
import { runAndPersistDiscoveryCycle } from "../workflow";
import { planCampaign, dispatchRender } from "../orchestrator";
import { runContentQA } from "../qa";
import { derivePerformanceLearnings } from "../learning/performance";
import { selectTargets, findRenderer, findPublisher, mediaUrlFromRender, publishText } from "../daily";
import { createCloudflareGrowthRuntime, type GrowthWorkflowEnv } from "./runtime";
import {
  audit, finishDailyGrowthRun, loadGrowthProducts, loadLearnings, loadRecentPerformance, loadSocialConnections, loadTodayUsage,
  persistApproval, persistLearnings, persistMetricObservations, persistPublication, persistQAResult, persistRenderResult, recordSpend, startDailyGrowthRun,
  type D1QueryableDatabaseLike,
} from "../storage/daily";
import type { ContentIdea, ProductBrain, RenderRequest, RenderResult } from "../types";

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
export class DailyGrowthWorkflow extends WorkflowEntrypoint<GrowthWorkflowEnv, DailyWorkflowPayload> {
  async run(event: WorkflowEvent<DailyWorkflowPayload>, step: WorkflowStep) {
    const db = this.env.GROWTH_DB as D1QueryableDatabaseLike;
    const productFilter = event.payload?.productId;
    const maxIdeas = Math.max(1, Math.min(event.payload?.maxIdeasPerProduct ?? 6, 20));

    const products = await step.do("load active growth products", async () => {
      const all = await loadGrowthProducts(db);
      return productFilter ? all.filter((p) => p.productId === productFilter) : all;
    });

    const summaries: ProductRunSummary[] = [];
    for (const product of products) {
      const summary = await this.runProduct(product, event, step, maxIdeas);
      summaries.push(summary);
    }
    return { schedule: event.schedule ?? null, productCount: summaries.length, summaries };
  }

  private async runProduct(product: ProductBrain, event: WorkflowEvent<DailyWorkflowPayload>, step: WorkflowStep, maxIdeas: number): Promise<ProductRunSummary> {
    const db = this.env.GROWTH_DB as D1QueryableDatabaseLike;
    const runtime = createCloudflareGrowthRuntime(this.env);
    const safeName = product.productId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48);
    const started = await step.do(`${safeName}: start run`, () => startDailyGrowthRun(db, product.productId, event.schedule?.scheduledTime ? new Date(event.schedule.scheduledTime).toISOString() : undefined));

    let rendered = 0, reviews = 0, publications = 0, spendUsd = 0;
    let trendRunId: string | undefined;
    let contentRunId: string | undefined;
    try {
      const learnings = await step.do(`${safeName}: load learnings`, () => loadLearnings(db, product.productId));
      const discovery = await step.do(`${safeName}: scout trends and build content`, { retries: { limit: 3, delay: "20 seconds", backoff: "exponential" }, timeout: "8 minutes" }, async () => {
        const providers = await runtime.trendProviders(product);
        const model = runtime.contentModel ? await runtime.contentModel(product) : undefined;
        return runAndPersistDiscoveryCycle(db, product, providers, { content: { ideaCount: Math.max(12, maxIdeas * 2), experimentCount: Math.min(4, maxIdeas), variantsPerExperiment: 3, learnings, ...(model ? { model } : {}) } });
      });
      trendRunId = discovery.trends.runId;
      contentRunId = discovery.content.runId;

      const plan = await step.do(`${safeName}: plan campaign and QA`, async () => {
        const campaign = planCampaign(product, discovery.content.ideas, maxIdeas);
        const qaRows = campaign.selected.map((idea) => ({ idea, qa: runContentQA(product, idea) }));
        for (const row of qaRows) await persistQAResult(db, product.productId, row.idea.id, row.qa);
        return qaRows;
      });

      const connections = await step.do(`${safeName}: load social connections and budget`, async () => ({
        connections: await loadSocialConnections(db, product.productId),
        usage: await loadTodayUsage(db, product.productId),
      }));
      const remainingSlots = Math.max(0, product.autonomy.maxPublishesPerDay - connections.usage.publishes);
      let remainingSpend = Math.max(0, product.autonomy.maxSpendUsdPerDay - connections.usage.spendUsd);
      const targetSelections = selectTargets(product, plan.map((x) => x.idea), connections.connections, remainingSlots);
      const targetByIdea = new Map(targetSelections.map((x) => [x.idea.id, x.targetConnections]));
      const renderers = await runtime.renderers(product);
      const publishers = await runtime.publishers(product);

      for (const row of plan) {
        const idea = row.idea;
        const qa = row.qa;
        const itemName = `${safeName}:${idea.id.slice(-12)}`;
        let renderId: string | undefined;
        let renderResult: RenderResult | undefined;

        if (!qa.passed) {
          await step.do(`${itemName}: queue blocked review`, async () => {
            reviews += 1;
            await persistApproval(db, product.productId, idea.id, undefined, `QA blocked: ${qa.issues.map((i) => i.code).join(", ")}`);
            await audit(db, product.productId, "review_requested", "content_idea", idea.id, "blocked", { issues: qa.issues });
          });
          continue;
        }

        const renderer = findRenderer(idea, renderers);
        if (idea.format !== "text_post") {
          if (!renderer) {
            await step.do(`${itemName}: renderer missing review`, async () => {
              reviews += 1;
              await persistApproval(db, product.productId, idea.id, undefined, `No renderer configured for ${idea.format}`);
            });
            continue;
          }

          const renderRequest: RenderRequest = { id: `rr_${idea.id}`, productId: product.productId, idea, aspectRatio: "9:16", outputR2Prefix: `growth/${product.productId}/${idea.id}` };
          renderResult = await step.do(`${itemName}: start render`, { retries: { limit: 3, delay: "20 seconds", backoff: "exponential" }, timeout: "10 minutes" }, async () => dispatchRender(renderRequest, renderers));
          renderId = await step.do(`${itemName}: persist render`, () => persistRenderResult(db, idea.id, renderResult!));

          if ((renderResult.status === "queued" || renderResult.status === "rendering") && renderer.status && renderResult.providerJobId) {
            const providerJobId = renderResult.providerJobId;
            for (let poll = 1; poll <= 12; poll++) {
              await step.sleep(`${itemName}: wait render ${poll}`, "30 seconds");
              renderResult = await step.do(`${itemName}: poll render ${poll}`, { retries: { limit: 2, delay: "10 seconds", backoff: "linear" }, timeout: "2 minutes" }, () => renderer.status!(providerJobId));
              await step.do(`${itemName}: persist render poll ${poll}`, () => persistRenderResult(db, idea.id, renderResult!, renderId));
              if (renderResult.status === "completed" || renderResult.status === "failed") break;
            }
          }

          if (renderResult.status !== "completed") {
            await step.do(`${itemName}: failed render review`, async () => {
              reviews += 1;
              await persistApproval(db, product.productId, idea.id, renderId, renderResult?.error ?? "Render not completed within polling window");
            });
            continue;
          }
          rendered += 1;
          const renderCost = renderResult.costUsd ?? 0;
          spendUsd += renderCost;
          remainingSpend -= renderCost;
          await step.do(`${itemName}: record render spend`, () => recordSpend(db, product.productId, started.runId, idea.id, "render", renderResult!.provider, renderCost));
        }

        const targets = targetByIdea.get(idea.id) ?? [];
        const mustReview = product.autonomy.mode === "review" || !qa.autoPublishEligible || remainingSpend < 0 || targets.length === 0;
        if (mustReview) {
          await step.do(`${itemName}: request approval`, async () => {
            reviews += 1;
            const reason = product.autonomy.mode === "review" ? "Product is in review mode" : !qa.autoPublishEligible ? "QA requires review" : remainingSpend < 0 ? "Daily spend cap reached" : "No compatible connected social account";
            await persistApproval(db, product.productId, idea.id, renderId, reason);
            await audit(db, product.productId, "review_requested", "content_idea", idea.id, "pending", { reason });
          });
          continue;
        }

        for (const connection of targets) {
          const publisher = findPublisher(connection.platform, publishers);
          if (!publisher) {
            await step.do(`${itemName}:${connection.platform}: publisher missing`, () => persistApproval(db, product.productId, idea.id, renderId, `No publisher configured for ${connection.platform}`));
            reviews += 1;
            continue;
          }
          const result = await step.do(`${itemName}:${connection.platform}: publish`, { retries: { limit: 3, delay: "30 seconds", backoff: "exponential" }, timeout: "5 minutes" }, async () => {
            const credential = await runtime.credentialVault.resolve(connection);
            const mediaUrl = mediaUrlFromRender(renderResult);
            return publisher.publish({
              contentId: idea.id,
              productId: product.productId,
              platform: connection.platform,
              connectionId: connection.id,
              ...(mediaUrl ? { mediaUrl } : {}),
              text: publishText(idea),
              title: idea.hook.slice(0, 120),
              metadata: { autonomyMode: product.autonomy.mode },
            }, credential);
          });
          await step.do(`${itemName}:${connection.platform}: persist publish`, async () => {
            await persistPublication(db, { productId: product.productId, ideaId: idea.id, ...(renderId ? { renderId } : {}), platform: connection.platform, connectionId: connection.id, result });
            await audit(db, product.productId, "publish_attempt", "content_idea", idea.id, result.status, { platform: connection.platform, error: result.error });
          });
          if (result.status === "published" || result.status === "queued") publications += 1;
          else if (result.status === "needs_review") {
            reviews += 1;
            await step.do(`${itemName}:${connection.platform}: publish review`, () => persistApproval(db, product.productId, idea.id, renderId, result.error ?? `${connection.platform} requires review`));
          }
        }
      }

      const metricsPull = await step.do(`${safeName}: pull attribution metrics`, { retries: { limit: 2, delay: "20 seconds", backoff: "linear" }, timeout: "3 minutes" }, async () => {
        const providers = runtime.metricsProviders ? await runtime.metricsProviders(product) : [];
        let ingested = 0;
        const errors: Array<{ provider: string; error: string }> = [];
        for (const provider of providers) {
          try {
            const observations = await provider.collect(product);
            await persistMetricObservations(db, observations);
            ingested += observations.length;
          } catch (error) {
            errors.push({ provider: provider.name, error: error instanceof Error ? error.message : String(error) });
          }
        }
        return { providers: providers.length, ingested, errors };
      });

      const learningResult = await step.do(`${safeName}: refresh learnings`, async () => {
        const performance = await loadRecentPerformance(db, product.productId, 250);
        const next = derivePerformanceLearnings(performance);
        await persistLearnings(db, product.productId, next);
        return { performanceRows: performance.length, learnings: next.length };
      });

      const status: ProductRunSummary["status"] = reviews > 0 ? "partial" : "completed";
      await step.do(`${safeName}: finish run`, () => finishDailyGrowthRun(db, started.runId, {
        status, ...(trendRunId ? { trendRunId } : {}), ...(contentRunId ? { contentRunId } : {}), selectedCount: plan.length,
        renderedCount: rendered, reviewCount: reviews, publishCount: publications, spendUsd,
        summary: { metricsPull, learningResult, mode: product.autonomy.mode, connectedAccounts: connections.connections.length },
      }));
      return { productId: product.productId, status, selected: plan.length, rendered, reviews, publications, spendUsd };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await step.do(`${safeName}: fail run`, () => finishDailyGrowthRun(db, started.runId, {
        status: "failed", ...(trendRunId ? { trendRunId } : {}), ...(contentRunId ? { contentRunId } : {}), selectedCount: 0,
        renderedCount: rendered, reviewCount: reviews, publishCount: publications, spendUsd, error: message,
      }));
      return { productId: product.productId, status: "failed", selected: 0, rendered, reviews, publications, spendUsd, error: message };
    }
  }
}
