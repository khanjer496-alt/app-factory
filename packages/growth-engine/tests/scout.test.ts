import test from "node:test";
import assert from "node:assert/strict";
import { TrendScout } from "../src/trends/scout";
import { ManualTrendProvider } from "../src/providers/trends/manual";
import type { ProductBrain, TrendSignal } from "../src/types";

const product: ProductBrain = {
  productId: "p1", name: "ApplyFlow", domain: "applyflow.ai", oneLiner: "AI job-search agent",
  audiences: ["job seekers"], positioning: ["tailored CV for every job"], contentPillars: ["job search", "CV tailoring"],
  allowedClaims: ["tailors CVs"], prohibitedClaims: ["guaranteed job"], languages: ["en"],
  ctas: [{ label: "Try ApplyFlow", url: "https://applyflow.ai" }],
  brand: { voice: ["direct"], avoid: ["hype"] },
  autonomy: { mode: "review", maxPublishesPerDay: 4, maxSpendUsdPerDay: 5, minAutoPublishConfidence: 0.92 },
};

const signals: TrendSignal[] = [
  { id: "1", source: "test", observedAt: new Date().toISOString(), text: "job seekers are using AI to tailor CVs", keywords: ["job", "cv", "ai"], velocity: 90000, volume: 500000, confidence: 0.9 },
  { id: "2", source: "test", observedAt: new Date().toISOString(), text: "football transfer news", keywords: ["football"], velocity: 100000, volume: 1000000, confidence: 0.9 },
];

test("TrendScout ranks product-relevant trends above unrelated volume", async () => {
  const report = await new TrendScout([new ManualTrendProvider(signals)]).run(product, { minTrendScore: 0 });
  assert.equal(report.selected[0]?.id, "1");
});
