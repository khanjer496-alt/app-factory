import test from "node:test";
import assert from "node:assert/strict";
import { ContentBrain } from "../src/content/brain";
import type { ProductBrain, ScoredTrendSignal } from "../src/types";

const product: ProductBrain = {
  productId: "p1", name: "ApplyFlow", domain: "applyflow.ai", oneLiner: "AI job-search agent",
  audiences: ["job seekers"], positioning: ["tailored CV for every job"], contentPillars: ["job search", "CV tailoring"],
  allowedClaims: ["tailors CVs"], prohibitedClaims: ["guaranteed job"], languages: ["en", "ar"],
  ctas: [{ label: "Try ApplyFlow", url: "https://applyflow.ai" }],
  brand: { voice: ["direct"], avoid: ["hype"] },
  autonomy: { mode: "review", maxPublishesPerDay: 4, maxSpendUsdPerDay: 5, minAutoPublishConfidence: 0.92 },
};
const trend: ScoredTrendSignal = {
  id: "t1", source: "test", observedAt: new Date().toISOString(), text: "AI job search", keywords: ["ai", "job"], confidence: 0.9,
  trendScore: 85, productRelevance: 0.95, freshness: 1, reasons: ["strong relevance"],
};

test("ContentBrain creates deterministic fallback ideas and experiments", async () => {
  const report = await new ContentBrain().generate(product, [trend], { ideaCount: 8, experimentCount: 2, variantsPerExperiment: 3 });
  assert.equal(report.fallbackUsed, true);
  assert.ok(report.ideas.length >= 6);
  assert.equal(report.experiments.length, 2);
  assert.equal(report.experiments[0]?.variants.length, 3);
});
