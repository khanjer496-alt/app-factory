import product from "./product-profile.json" with { type: "json" };
import trends from "./sample-trends.json" with { type: "json" };
import { ManualTrendProvider } from "../src/providers/trends/manual";
import { runGrowthDiscovery } from "../src/pipeline";
import type { ProductBrain, TrendSignal } from "../src/types";

const result = await runGrowthDiscovery(
  product as ProductBrain,
  [new ManualTrendProvider(trends as TrendSignal[])],
  { trend: { minTrendScore: 0 }, content: { ideaCount: 10, experimentCount: 3 } },
);

console.log(JSON.stringify(result, null, 2));
