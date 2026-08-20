const clamp = (n) => Math.max(0, Math.min(1, n));
export function scoreIdea(s) {
    const value = s.productRelevance * 0.28 +
        s.trendVelocity * 0.16 +
        s.proofStrength * 0.18 +
        s.conversionFit * 0.24 +
        s.novelty * 0.14 -
        s.estimatedCost * 0.06 -
        s.riskPenalty * 0.16;
    return Math.round(clamp(value) * 100);
}
export function rankIdeas(ideas) {
    return [...ideas].sort((a, b) => b.score - a.score || b.confidence - a.confidence);
}
//# sourceMappingURL=scoring.js.map