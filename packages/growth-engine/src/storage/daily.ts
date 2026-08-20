import type { ContentIdea, PerformanceLearning, ProductBrain, QAResult, RenderResult, PublishResult } from "../types";
import type { D1DatabaseLike, D1PreparedStatementLike } from "./d1";
import type { SocialConnectionRecord } from "../runtime";
import type { ObservedContentPerformance } from "../learning/performance";

interface D1QueryStatementLike extends D1PreparedStatementLike {
  first?<T = Record<string, unknown>>(): Promise<T | null>;
  all?<T = Record<string, unknown>>(): Promise<{ results?: T[] } | T[]>;
}
export interface D1QueryableDatabaseLike extends D1DatabaseLike {
  prepare(sql: string): D1QueryStatementLike;
}

function id(prefix: string) {
  return `${prefix}_${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
}

async function allRows<T>(statement: D1QueryStatementLike): Promise<T[]> {
  if (!statement.all) throw new Error("D1 statement does not support all()");
  const result = await statement.all<T>();
  return Array.isArray(result) ? result : result.results ?? [];
}

export async function loadGrowthProducts(db: D1QueryableDatabaseLike): Promise<ProductBrain[]> {
  const rows = await allRows<{ product_brain_json: string }>(
    db.prepare(`SELECT product_brain_json FROM growth_products ORDER BY created_at ASC`),
  );
  return rows.flatMap((row) => {
    try { return [JSON.parse(row.product_brain_json) as ProductBrain]; } catch { return []; }
  });
}

export async function loadSocialConnections(db: D1QueryableDatabaseLike, productId: string): Promise<SocialConnectionRecord[]> {
  const rows = await allRows<{
    id: string; product_id: string; platform: string; account_external_id: string | null; account_handle: string | null;
    credential_ref: string; scopes_json: string; expires_at: string | null; status: string;
  }>(db.prepare(`SELECT id, product_id, platform, account_external_id, account_handle, credential_ref, scopes_json, expires_at, status
      FROM social_connections WHERE product_id = ? AND status = 'connected'`).bind(productId));
  return rows.map((row) => ({
    id: row.id,
    productId: row.product_id,
    platform: row.platform as SocialConnectionRecord["platform"],
    credentialRef: row.credential_ref,
    scopes: safeJsonArray(row.scopes_json),
    status: row.status,
    ...(row.account_external_id ? { accountExternalId: row.account_external_id } : {}),
    ...(row.account_handle ? { accountHandle: row.account_handle } : {}),
    ...(row.expires_at ? { expiresAt: row.expires_at } : {}),
  }));
}

export async function startDailyGrowthRun(db: D1QueryableDatabaseLike, productId: string, scheduledFor?: string) {
  const runId = id("growthrun");
  const startedAt = new Date().toISOString();
  await db.prepare(`INSERT INTO daily_growth_runs (id, product_id, scheduled_for, started_at, status)
    VALUES (?, ?, ?, ?, 'running')`).bind(runId, productId, scheduledFor ?? null, startedAt).run();
  return { runId, startedAt };
}

export async function finishDailyGrowthRun(
  db: D1QueryableDatabaseLike,
  runId: string,
  input: { status: "completed" | "partial" | "failed"; trendRunId?: string; contentRunId?: string; selectedCount: number; renderedCount: number; reviewCount: number; publishCount: number; spendUsd: number; summary?: Record<string, unknown>; error?: string },
) {
  await db.prepare(`UPDATE daily_growth_runs SET completed_at = ?, status = ?, trend_run_id = ?, content_run_id = ?,
    selected_count = ?, rendered_count = ?, review_count = ?, publish_count = ?, spend_usd = ?, summary_json = ?, error = ? WHERE id = ?`)
    .bind(new Date().toISOString(), input.status, input.trendRunId ?? null, input.contentRunId ?? null, input.selectedCount,
      input.renderedCount, input.reviewCount, input.publishCount, input.spendUsd, JSON.stringify(input.summary ?? {}), input.error ?? null, runId).run();
}

export async function persistQAResult(db: D1QueryableDatabaseLike, productId: string, ideaId: string, qa: QAResult) {
  await db.prepare(`INSERT OR REPLACE INTO content_qa_results
    (idea_id, product_id, passed, auto_publish_eligible, issues_json, checked_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(ideaId, productId, qa.passed ? 1 : 0, qa.autoPublishEligible ? 1 : 0, JSON.stringify(qa.issues), new Date().toISOString()).run();
}

export async function persistApproval(db: D1QueryableDatabaseLike, productId: string, ideaId: string, renderId: string | undefined, reason: string) {
  const approvalId = id("approval");
  await db.prepare(`INSERT INTO content_approvals (id, product_id, idea_id, render_id, status, reason, requested_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)`)
    .bind(approvalId, productId, ideaId, renderId ?? null, reason, new Date().toISOString()).run();
  await db.prepare(`UPDATE content_ideas SET status = 'pending_approval' WHERE id = ?`).bind(ideaId).run();
  return approvalId;
}

export async function persistRenderResult(db: D1QueryableDatabaseLike, ideaId: string, result: RenderResult, existingRenderId?: string) {
  const renderId = existingRenderId ?? id("render");
  if (existingRenderId) {
    await db.prepare(`UPDATE content_renders SET provider_job_id = ?, status = ?, media_r2_key = ?, cost_usd = ?, error = ?, updated_at = ? WHERE id = ?`)
      .bind(result.providerJobId ?? null, result.status, result.mediaR2Key ?? result.mediaUrl ?? null, result.costUsd ?? 0, result.error ?? null, new Date().toISOString(), renderId).run();
  } else {
    await db.prepare(`INSERT INTO content_renders (id, idea_id, provider, provider_job_id, status, media_r2_key, cost_usd, error, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(renderId, ideaId, result.provider, result.providerJobId ?? null, result.status, result.mediaR2Key ?? result.mediaUrl ?? null,
        result.costUsd ?? 0, result.error ?? null, new Date().toISOString(), new Date().toISOString()).run();
  }
  return renderId;
}

export async function persistPublication(
  db: D1QueryableDatabaseLike,
  input: { productId: string; ideaId: string; renderId?: string; platform: string; connectionId: string; result: PublishResult; scheduledAt?: string },
) {
  const publicationId = id("pub");
  const publishedAt = input.result.status === "published" ? new Date().toISOString() : null;
  await db.prepare(`INSERT INTO content_publications
    (id, product_id, idea_id, render_id, platform, connection_id, status, scheduled_at, published_at, external_post_id, external_url, error)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(publicationId, input.productId, input.ideaId, input.renderId ?? null, input.platform, input.connectionId,
      input.result.status, input.scheduledAt ?? null, publishedAt, input.result.externalPostId ?? null, input.result.externalUrl ?? null,
      input.result.error ?? null).run();
  if (input.result.status === "published" || input.result.status === "queued") {
    await db.prepare(`UPDATE content_ideas SET status = 'published' WHERE id = ?`).bind(input.ideaId).run();
  }
  return publicationId;
}

export async function recordSpend(db: D1QueryableDatabaseLike, productId: string, runId: string, ideaId: string, category: string, provider: string, amountUsd: number) {
  if (amountUsd <= 0) return;
  await db.prepare(`INSERT INTO growth_budget_ledger (id, product_id, run_id, idea_id, category, provider, amount_usd, created_at, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, '{}')`)
    .bind(id("spend"), productId, runId, ideaId, category, provider, amountUsd, new Date().toISOString()).run();
}

export async function loadTodayUsage(db: D1QueryableDatabaseLike, productId: string): Promise<{ publishes: number; spendUsd: number }> {
  const day = new Date().toISOString().slice(0, 10);
  const pubRows = await allRows<{ n: number }>(db.prepare(`SELECT COUNT(*) AS n FROM content_publications
    WHERE product_id = ? AND substr(created_at, 1, 10) = ? AND status IN ('published','queued')`).bind(productId, day));
  const spendRows = await allRows<{ n: number | null }>(db.prepare(`SELECT COALESCE(SUM(amount_usd), 0) AS n FROM growth_budget_ledger
    WHERE product_id = ? AND substr(created_at, 1, 10) = ?`).bind(productId, day));
  return { publishes: Number(pubRows[0]?.n ?? 0), spendUsd: Number(spendRows[0]?.n ?? 0) };
}

export async function loadRecentPerformance(db: D1QueryableDatabaseLike, productId: string, limit = 200): Promise<ObservedContentPerformance[]> {
  const rows = await allRows<{
    idea_id: string; source_trend_ids_json: string; hook: string; angle: string; format: ContentIdea["format"]; language: string;
    script: string | null; visual_plan_json: string; cta: string | null; score: number; confidence: number; risk: ContentIdea["risk"];
    views: number | null; clicks: number | null; signups: number | null; paid_conversions: number | null; revenue_usd: number | null;
  }>(db.prepare(`SELECT i.id AS idea_id, i.source_trend_ids_json, i.hook, i.angle, i.format, i.language, i.script,
      i.visual_plan_json, i.cta, i.score, i.confidence, i.risk,
      MAX(m.views) AS views, MAX(m.clicks) AS clicks, MAX(m.signups) AS signups,
      MAX(m.paid_conversions) AS paid_conversions, MAX(m.revenue_usd) AS revenue_usd
    FROM content_ideas i
    JOIN content_publications p ON p.idea_id = i.id
    LEFT JOIN content_metrics m ON m.publication_id = p.id
    WHERE i.product_id = ?
    GROUP BY i.id
    ORDER BY MAX(COALESCE(m.observed_at, p.created_at)) DESC
    LIMIT ?`).bind(productId, limit));
  return rows.map((row) => ({
    idea: {
      id: row.idea_id, productId, sourceTrendIds: safeJsonArray(row.source_trend_ids_json), hook: row.hook, angle: row.angle,
      format: row.format, language: row.language, score: row.score, confidence: row.confidence, risk: row.risk,
      ...(row.script ? { script: row.script } : {}),
      visualPlan: safeJsonArray(row.visual_plan_json),
      ...(row.cta ? { cta: row.cta } : {}),
    },
    ...(row.views != null ? { views: row.views } : {}),
    ...(row.clicks != null ? { clicks: row.clicks } : {}),
    ...(row.signups != null ? { signups: row.signups } : {}),
    ...(row.paid_conversions != null ? { paidConversions: row.paid_conversions } : {}),
    ...(row.revenue_usd != null ? { revenueUsd: row.revenue_usd } : {}),
  }));
}

export async function persistLearnings(db: D1QueryableDatabaseLike, productId: string, learnings: PerformanceLearning[]) {
  if (!learnings.length) return;
  const statements = learnings.map((learning) => db.prepare(`INSERT INTO growth_learnings
    (id, product_id, learning_key, learning_value, confidence, evidence_count, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(product_id, learning_key) DO UPDATE SET learning_value = excluded.learning_value,
      confidence = excluded.confidence, evidence_count = excluded.evidence_count, updated_at = excluded.updated_at`)
    .bind(id("learning"), productId, learning.key, learning.value, learning.confidence, learning.evidenceCount, new Date().toISOString()));
  await db.batch(statements);
}

export async function loadLearnings(db: D1QueryableDatabaseLike, productId: string): Promise<PerformanceLearning[]> {
  const rows = await allRows<{ learning_key: string; learning_value: string; confidence: number; evidence_count: number }>(
    db.prepare(`SELECT learning_key, learning_value, confidence, evidence_count FROM growth_learnings WHERE product_id = ? ORDER BY confidence DESC, evidence_count DESC LIMIT 50`).bind(productId),
  );
  return rows.map((row) => ({ key: row.learning_key, value: row.learning_value, confidence: row.confidence, evidenceCount: row.evidence_count }));
}

export async function audit(db: D1QueryableDatabaseLike, productId: string, action: string, targetType: string, targetId: string, result: string, details: Record<string, unknown> = {}) {
  await db.prepare(`INSERT INTO growth_audit_log (id, product_id, actor_type, actor_id, action, target_type, target_id, result, details_json, created_at)
    VALUES (?, ?, 'growth_agent', 'daily_workflow', ?, ?, ?, ?, ?, ?)`)
    .bind(id("audit"), productId, action, targetType, targetId, result, JSON.stringify(details), new Date().toISOString()).run();
}

function safeJsonArray(value: string): string[] {
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; }
}

import type { GrowthMetricObservation } from "../providers/metrics/interface";

export async function persistMetricObservations(db: D1QueryableDatabaseLike, observations: GrowthMetricObservation[]) {
  if (!observations.length) return;
  const statements = observations.map((row) => db.prepare(`INSERT INTO content_metrics
    (id, publication_id, observed_at, views, impressions, engagements, clicks, signups, paid_conversions, revenue_usd, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id("metric"), row.publicationId, row.observedAt, row.views ?? null, row.impressions ?? null, row.engagements ?? null,
      row.clicks ?? null, row.signups ?? null, row.paidConversions ?? null, row.revenueUsd ?? null, JSON.stringify(row.raw ?? {})));
  await db.batch(statements);
}

export interface ApprovalBundle {
  approvalId: string;
  product: ProductBrain;
  idea: ContentIdea;
  renderId?: string;
  mediaUrl?: string;
  status: string;
}

export async function loadApprovalBundle(db: D1QueryableDatabaseLike, approvalId: string): Promise<ApprovalBundle | null> {
  const rows = await allRows<{
    approval_id: string; approval_status: string; product_brain_json: string; idea_id: string; product_id: string;
    source_trend_ids_json: string; hook: string; angle: string; format: ContentIdea["format"]; language: string; script: string | null;
    visual_plan_json: string; cta: string | null; score: number; confidence: number; risk: ContentIdea["risk"]; render_id: string | null; media_r2_key: string | null;
  }>(db.prepare(`SELECT a.id AS approval_id, a.status AS approval_status, gp.product_brain_json,
      i.id AS idea_id, i.product_id, i.source_trend_ids_json, i.hook, i.angle, i.format, i.language, i.script,
      i.visual_plan_json, i.cta, i.score, i.confidence, i.risk, r.id AS render_id, r.media_r2_key
    FROM content_approvals a
    JOIN growth_products gp ON gp.id = a.product_id
    JOIN content_ideas i ON i.id = a.idea_id
    LEFT JOIN content_renders r ON r.id = a.render_id
    WHERE a.id = ? LIMIT 1`).bind(approvalId));
  const row = rows[0];
  if (!row) return null;
  let product: ProductBrain;
  try { product = JSON.parse(row.product_brain_json) as ProductBrain; } catch { return null; }
  const idea: ContentIdea = {
    id: row.idea_id, productId: row.product_id, sourceTrendIds: safeJsonArray(row.source_trend_ids_json), hook: row.hook, angle: row.angle,
    format: row.format, language: row.language, score: row.score, confidence: row.confidence, risk: row.risk,
    ...(row.script ? { script: row.script } : {}), visualPlan: safeJsonArray(row.visual_plan_json), ...(row.cta ? { cta: row.cta } : {}),
  };
  return {
    approvalId: row.approval_id, product, idea, status: row.approval_status,
    ...(row.render_id ? { renderId: row.render_id } : {}),
    ...(row.media_r2_key?.startsWith("http") ? { mediaUrl: row.media_r2_key } : {}),
  };
}

export async function decideApproval(db: D1QueryableDatabaseLike, approvalId: string, decision: "approved" | "rejected", decidedBy: string, note?: string) {
  await db.prepare(`UPDATE content_approvals SET status = ?, decided_at = ?, decided_by = ?, decision_note = ? WHERE id = ? AND status = 'pending'`)
    .bind(decision, new Date().toISOString(), decidedBy, note ?? null, approvalId).run();
}
