# Trend Scout + Content Brain

This is the discovery/intelligence layer of the Growth Engine.

## What Trend Scout does

Trend Scout runs multiple sources in parallel, normalizes the results into one `TrendSignal` shape, deduplicates them, and scores each signal for a specific product.

Current source adapters:

- `ManualTrendProvider` — seed URLs/observations manually or from an operator agent.
- `YouTubeTrendProvider` — official YouTube Data API; searches recent videos around product/category terms, retrieves statistics, and estimates views-per-hour/engagement.
- `RssTrendProvider` — generic RSS/Atom source for industry/news/trend feeds.
- `createGoogleTrendsProvider()` — optional Google Trends RSS adapter. Treat it as best-effort because Google does not provide a stable general public Trends API for this feed.
- `JsonTrendFeedProvider` — normalized adapter for a partner API, search service, browser scout, data vendor, or your own trend collector.
- `OpenAIWebTrendProvider` — optional Responses API + web-search discovery source for current public-web patterns; use as a discovery signal, not as authoritative volume data.

Do not make TikTok/Instagram scraping a hard dependency. Add approved APIs/data partners or a separate browser scout behind `JsonTrendFeedProvider` so the Growth Engine is not coupled to brittle scraping code.

### Scoring

Each trend receives a 0–100 score using:

- product/audience relevance;
- freshness;
- observed velocity;
- observed volume;
- engagement;
- source confidence.

High volume alone should not beat a lower-volume trend that is strongly relevant to the product. The final selection also caps how many results can come from one provider so one source does not dominate the feed.

## What Content Brain does

Content Brain consumes:

1. the product brain;
2. the highest-ranked trend signals;
3. historical performance learnings;
4. an optional text model.

It outputs ranked `ContentIdea` objects and `ContentExperiment` groups.

Each idea contains:

- hook;
- angle;
- content format;
- language;
- script/copy;
- visual plan;
- CTA;
- confidence;
- risk;
- rationale;
- score;
- source trend IDs.

Supported formats:

- product demo;
- slideshow;
- faceless video;
- UGC/avatar;
- image post;
- text post.

## AI routing

The Content Brain uses the generic `TextModel` interface. In the App Factory, route `growth.content_brain` to the cheapest model that reliably follows the JSON instructions. The intended default is a cost-sensitive model such as GPT-5.6 Luna; keep the actual API model ID configurable rather than hard-coding it in domain logic.

A lightweight OpenAI Responses API adapter is included at:

`src/providers/models/openai-responses.ts`

Example:

```ts
const model = new OpenAIResponsesTextModel({
  apiKey: env.OPENAI_API_KEY,
  model: env.OPENAI_CONTENT_MODEL,
});
```

The adapter sends `store: false` and expects the Content Brain prompt to return JSON.

## Fallback behavior

If no model is configured, the model fails, or invalid JSON is returned, Content Brain generates deterministic template ideas instead. That keeps trend-to-content workflows operational during provider outages.

## Experiments

Top ideas are converted into experiments. Variants deliberately change hooks and/or formats so the system can learn which combination generates:

- clicks;
- signups;
- paid conversions;
- revenue.

The initial primary metrics prioritize conversions rather than vanity views.

## Performance memory

`derivePerformanceLearnings()` converts historical content performance into reusable signals such as:

- `format:product_demo`;
- `language:ar`;
- `angle:Before vs after`.

Those learnings can be fed back into the next Content Brain call.

## Persistence

Migration `002_trend_scout_content_brain.sql` adds:

- `trend_scout_runs`;
- `trend_signal_scores`;
- `content_brain_runs`;
- `content_experiments`;
- `content_experiment_variants`;
- `growth_learnings`.

`runAndPersistDiscoveryCycle()` provides a Workflow-friendly entry point that runs Trend Scout + Content Brain and writes both reports to D1.

## Recommended Cloudflare Workflow

```text
Cron / product event
        |
        v
Trend Scout
        |
        +-- YouTube API
        +-- Google Trends/RSS
        +-- approved partner feeds
        +-- browser/search scout JSON feed
        |
        v
Dedupe + score + diversify
        |
        v
Content Brain (Luna route)
        |
        v
Generate experiments
        |
        v
Persist D1
        |
        v
QA + approval policy
        |
        v
Render -> R2 -> Publish
        |
        v
Metrics / revenue
        |
        v
Performance learnings
        |
        +----------> next cycle
```

## Suggested cadence

- broad trend scan: every 4–6 hours;
- category/product scan: every 2–4 hours;
- Content Brain: after a meaningful new trend batch, or 1–2 times/day per product;
- performance learning refresh: daily;
- evergreen fallback: always available if trend quality is low.

Avoid generating dozens of near-identical posts just because a trend exists. Trend relevance, product truth, daily publish caps and QA remain release gates.
