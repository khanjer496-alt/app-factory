const formatOrder = ["product_demo", "slideshow", "faceless_video", "ugc_avatar", "text_post"];
export function deterministicIdeas(product, trends, count = 12) {
    const output = [];
    const cta = product.ctas[0]?.label ?? `Try ${product.name}`;
    const languages = product.languages.length ? product.languages : ["en"];
    const trendPool = trends.length ? trends : [syntheticTrend(product)];
    for (let i = 0; i < count; i++) {
        const trend = trendPool[i % trendPool.length];
        const language = languages[i % languages.length] ?? "en";
        const format = chooseFormat(trend, i);
        const hook = hooks(product, trend)[i % hooks(product, trend).length];
        const angle = angles(product)[i % angles(product).length];
        output.push({
            id: `idea_${hash(`${product.productId}:${trend.id}:${i}:${language}`)}`,
            productId: product.productId,
            sourceTrendIds: trend.id.startsWith("synthetic:") ? [] : [trend.id],
            hook,
            angle,
            format,
            language,
            script: buildScript(product, trend, hook, angle, cta),
            visualPlan: visualPlan(product, format),
            cta,
            score: Math.round(45 + trend.trendScore * 0.42 + (format === "product_demo" ? 10 : 0)),
            confidence: Math.min(0.9, 0.55 + trend.productRelevance * 0.3),
            risk: format === "ugc_avatar" ? "medium" : "low",
            rationale: `Template fallback using ${trend.text} with ${angle.toLowerCase()} angle.`,
        });
    }
    return output;
}
function chooseFormat(trend, index) {
    if (trend.format?.includes("photo") || trend.format?.includes("carousel"))
        return "slideshow";
    if (trend.format?.includes("text"))
        return "text_post";
    return formatOrder[index % formatOrder.length] ?? "faceless_video";
}
function hooks(product, trend) {
    return [
        `Stop doing this manually if you use ${product.name}`,
        `POV: ${product.oneLiner.toLowerCase()}`,
        `Nobody tells you this about ${trend.text}`,
        `I tried a faster way to ${product.contentPillars[0] ?? "get this done"}`,
        `${trend.text} is trending — here's the useful part for ${product.audiences[0] ?? "you"}`,
    ];
}
function angles(product) {
    return [
        `Pain → solution using ${product.name}`,
        "Before vs after",
        "Fast product proof",
        "Contrarian / common mistake",
        "Trend adaptation with practical takeaway",
    ];
}
function buildScript(product, trend, hook, angle, cta) {
    const proof = product.allowedClaims[0] ?? product.positioning[0] ?? product.oneLiner;
    return `${hook}\n\n${angle}. ${proof}. Show the product doing the work instead of describing it abstractly. ${cta}.`;
}
function visualPlan(product, format) {
    if (format === "product_demo")
        return ["Hook text", "Open product demo", "Show one core action", "Show result", `CTA: ${product.domain}`];
    if (format === "slideshow")
        return ["Bold hook slide", "Problem slide", "Insight slide", "Product proof slide", "CTA slide"];
    if (format === "ugc_avatar")
        return ["Natural talking-head hook", "Problem story", "Cut to product demo", "Result", "Soft CTA"];
    return ["Hook", "Relevant B-roll/product asset", "Proof", "Result", "CTA"];
}
function syntheticTrend(product) {
    return {
        id: `synthetic:${product.productId}`,
        source: "evergreen",
        observedAt: new Date().toISOString(),
        text: product.contentPillars[0] ?? product.oneLiner,
        keywords: product.contentPillars,
        confidence: 0.7,
        trendScore: 55,
        productRelevance: 1,
        freshness: 1,
        reasons: ["evergreen product content"],
    };
}
function hash(value) {
    let h = 2166136261;
    for (let i = 0; i < value.length; i++)
        h = Math.imul(h ^ value.charCodeAt(i), 16777619);
    return (h >>> 0).toString(36);
}
//# sourceMappingURL=templates.js.map