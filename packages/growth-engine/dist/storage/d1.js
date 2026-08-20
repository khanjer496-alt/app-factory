export async function persistTrendScoutReport(db, report) {
    const statements = [
        db.prepare(`INSERT INTO trend_scout_runs
      (id, product_id, started_at, completed_at, provider_summary_json, raw_count, deduped_count, selected_count, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')`)
            .bind(report.runId, report.productId, report.startedAt, report.completedAt, JSON.stringify(report.providers), report.rawCount, report.dedupedCount, report.selected.length),
    ];
    for (const trend of report.selected) {
        statements.push(upsertTrendStatement(db, report.productId, trend));
        statements.push(db.prepare(`INSERT OR REPLACE INTO trend_signal_scores
      (run_id, trend_signal_id, trend_score, product_relevance, freshness, reasons_json)
      VALUES (?, ?, ?, ?, ?, ?)`)
            .bind(report.runId, trend.id, trend.trendScore, trend.productRelevance, trend.freshness, JSON.stringify(trend.reasons)));
    }
    await db.batch(statements);
}
export async function persistContentBrainReport(db, report) {
    const statements = [
        db.prepare(`INSERT INTO content_brain_runs
      (id, product_id, generated_at, model, fallback_used, trend_ids_json, idea_count, experiment_count, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')`)
            .bind(report.runId, report.productId, report.generatedAt, report.model ?? null, report.fallbackUsed ? 1 : 0, JSON.stringify(report.trendsUsed), report.ideas.length, report.experiments.length),
    ];
    for (const idea of report.ideas) {
        statements.push(db.prepare(`INSERT OR REPLACE INTO content_ideas
      (id, product_id, source_trend_ids_json, hook, angle, format, language, script, visual_plan_json, cta, score, confidence, risk, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`)
            .bind(idea.id, idea.productId, JSON.stringify(idea.sourceTrendIds), idea.hook, idea.angle, idea.format, idea.language, idea.script ?? null, JSON.stringify(idea.visualPlan ?? []), idea.cta ?? null, idea.score, idea.confidence, idea.risk, report.generatedAt));
    }
    for (const experiment of report.experiments) {
        statements.push(db.prepare(`INSERT OR REPLACE INTO content_experiments
      (id, product_id, source_idea_id, hypothesis, primary_metric, status)
      VALUES (?, ?, ?, ?, ?, ?)`)
            .bind(experiment.id, experiment.productId, experiment.sourceIdeaId, experiment.hypothesis, experiment.primaryMetric, experiment.status));
        experiment.variants.forEach((variant, index) => {
            statements.push(db.prepare(`INSERT OR REPLACE INTO content_experiment_variants
        (experiment_id, idea_id, variant_label) VALUES (?, ?, ?)`)
                .bind(experiment.id, variant.id, String.fromCharCode(65 + index)));
        });
    }
    await db.batch(statements);
}
function upsertTrendStatement(db, trendProductId, trend) {
    return db.prepare(`INSERT OR REPLACE INTO trend_signals
    (id, product_id, source, observed_at, region, language, format, text, url, keywords_json, velocity, confidence, expires_at, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(trend.id, trendProductId, trend.source, trend.observedAt, trend.region ?? null, trend.language ?? null, trend.format ?? null, trend.text, trend.url ?? null, JSON.stringify(trend.keywords), trend.velocity ?? null, trend.confidence, trend.expiresAt ?? null, JSON.stringify({
        platform: trend.platform, category: trend.category, relatedTerms: trend.relatedTerms,
        volume: trend.volume, engagementRate: trend.engagementRate, metadata: trend.metadata,
    }));
}
//# sourceMappingURL=d1.js.map