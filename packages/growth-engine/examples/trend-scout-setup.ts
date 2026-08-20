import { createGoogleTrendsProvider } from "../src/providers/trends/google-trends";
import { YouTubeTrendProvider } from "../src/providers/trends/youtube";
import { FirecrawlTrendProvider } from "../src/providers/trends/firecrawl";
import { OpenAIResponsesTextModel } from "../src/providers/models/openai-responses";
import { runGrowthDiscovery } from "../src/pipeline";
import type { ProductBrain } from "../src/types";

declare const product: ProductBrain;
declare const env: { YOUTUBE_API_KEY: string; OPENAI_API_KEY: string; OPENAI_CONTENT_MODEL: string; FIRECRAWL_API_KEY?: string };

const providers = [
  createGoogleTrendsProvider(),
  new YouTubeTrendProvider({ apiKey: env.YOUTUBE_API_KEY }),
  ...(env.FIRECRAWL_API_KEY ? [new FirecrawlTrendProvider({ apiKey: env.FIRECRAWL_API_KEY })] : []),
];

const contentModel = new OpenAIResponsesTextModel({
  apiKey: env.OPENAI_API_KEY,
  model: env.OPENAI_CONTENT_MODEL,
});

const report = await runGrowthDiscovery(product, providers, {
  trend: { maxSelected: 30, maxPerSource: 12 },
  content: { model: contentModel, ideaCount: 18, experimentCount: 4, variantsPerExperiment: 3 },
});

console.log(report.content.ideas.slice(0, 5));
