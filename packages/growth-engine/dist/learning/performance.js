/** Small deterministic memory builder. A richer LLM summary can be layered on later. */
export function derivePerformanceLearnings(rows) {
    if (!rows.length)
        return [];
    const buckets = new Map();
    for (const row of rows) {
        const keys = [`format:${row.idea.format}`, `language:${row.idea.language}`, `angle:${row.idea.angle}`];
        for (const key of keys) {
            const bucket = buckets.get(key) ?? { revenue: 0, conversions: 0, clicks: 0, count: 0 };
            bucket.revenue += row.revenueUsd ?? 0;
            bucket.conversions += row.paidConversions ?? 0;
            bucket.clicks += row.clicks ?? 0;
            bucket.count += 1;
            buckets.set(key, bucket);
        }
    }
    return [...buckets.entries()]
        .map(([key, b]) => ({
        key,
        value: `avg_revenue=${(b.revenue / b.count).toFixed(2)}, avg_paid_conversions=${(b.conversions / b.count).toFixed(2)}, avg_clicks=${(b.clicks / b.count).toFixed(1)}`,
        confidence: Math.min(0.95, 0.45 + Math.log10(1 + b.count) * 0.25),
        evidenceCount: b.count,
    }))
        .sort((a, b) => b.evidenceCount - a.evidenceCount);
}
//# sourceMappingURL=performance.js.map