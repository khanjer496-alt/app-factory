import type { ProductBrain } from "../types";
import type { GrowthRuntime, CredentialVault, SocialConnectionRecord } from "../runtime";
import { createGoogleTrendsProvider } from "../providers/trends/google-trends";
import { RssTrendProvider } from "../providers/trends/rss";
import { YouTubeTrendProvider } from "../providers/trends/youtube";
import { OpenAIWebTrendProvider } from "../providers/trends/openai-web";
import { OpenAIResponsesTextModel } from "../providers/models/openai-responses";
import { MoneyPrinterRenderer } from "../providers/renderers/moneyprinter";
import { SlideshowRenderer } from "../providers/renderers/slideshow";
import { ProductDemoRenderer } from "../providers/renderers/product-demo";
import { UGCRenderer } from "../providers/renderers/ugc";
import { TikTokPublisher } from "../providers/publishers/tiktok";
import { InstagramPublisher } from "../providers/publishers/instagram";
import { YouTubePublisher } from "../providers/publishers/youtube";
import { XPublisher } from "../providers/publishers/x";
import type { PublisherProvider, PublishingCredential } from "../providers/publishers/interface";
import type { RendererProvider } from "../providers/renderers/interface";
import type { MetricsProvider } from "../providers/metrics/interface";
import { HttpAttributionMetricsProvider } from "../providers/metrics/http-attribution";

export interface GrowthWorkflowEnv {
  GROWTH_DB: any;
  OPENAI_API_KEY?: string;
  OPENAI_CONTENT_MODEL?: string;
  OPENAI_TREND_MODEL?: string;
  YOUTUBE_API_KEY?: string;
  GROWTH_ENABLE_GOOGLE_TRENDS?: string;
  GROWTH_RSS_FEEDS_JSON?: string;
  MONEYPRINTER_URL?: string;
  MONEYPRINTER_ACCESS_CLIENT_ID?: string;
  MONEYPRINTER_ACCESS_CLIENT_SECRET?: string;
  SOCIAL_CREDENTIALS_JSON?: string;
  GROWTH_METRICS_FEEDS_JSON?: string;
}

class EnvironmentCredentialVault implements CredentialVault {
  constructor(private readonly env: GrowthWorkflowEnv) {}
  async resolve(connection: SocialConnectionRecord): Promise<PublishingCredential> {
    // Starter implementation only. In production replace with a dedicated encrypted
    // credential/secrets service while keeping credential_ref in D1.
    const map = safeJson<Record<string, { accessToken: string; refreshToken?: string; expiresAt?: string; metadata?: Record<string, string> }>>(this.env.SOCIAL_CREDENTIALS_JSON, {});
    const value = map[connection.credentialRef];
    if (!value?.accessToken) throw new Error(`Missing credential for ${connection.credentialRef}`);
    return {
      connectionId: connection.id,
      platform: connection.platform,
      accessToken: value.accessToken,
      ...(value.refreshToken ? { refreshToken: value.refreshToken } : {}),
      ...(value.expiresAt ? { expiresAt: value.expiresAt } : {}),
      ...(value.metadata ? { metadata: value.metadata } : {}),
    };
  }
}

export function createCloudflareGrowthRuntime(env: GrowthWorkflowEnv): GrowthRuntime {
  return {
    trendProviders(product: ProductBrain) {
      const providers = [];
      if (env.YOUTUBE_API_KEY) providers.push(new YouTubeTrendProvider({ apiKey: env.YOUTUBE_API_KEY }));
      if (env.GROWTH_ENABLE_GOOGLE_TRENDS !== "false") providers.push(createGoogleTrendsProvider());
      if (env.OPENAI_API_KEY && env.OPENAI_TREND_MODEL) {
        providers.push(new OpenAIWebTrendProvider({ apiKey: env.OPENAI_API_KEY, model: env.OPENAI_TREND_MODEL, maxSignals: 20 }));
      }
      const feeds = safeJson<Array<{ name: string; url: string; confidence?: number }>>(env.GROWTH_RSS_FEEDS_JSON, []);
      for (const feed of feeds) {
        if (!feed?.name || !feed?.url) continue;
        providers.push(new RssTrendProvider({ name: feed.name, feedUrl: () => feed.url, ...(feed.confidence != null ? { defaultConfidence: feed.confidence } : {}) }));
      }
      return providers;
    },
    renderers() {
      const renderers: RendererProvider[] = [new SlideshowRenderer(), new ProductDemoRenderer(), new UGCRenderer()];
      if (env.MONEYPRINTER_URL) {
        renderers.unshift(new MoneyPrinterRenderer({
          baseUrl: env.MONEYPRINTER_URL,
          ...(env.MONEYPRINTER_ACCESS_CLIENT_ID ? { accessClientId: env.MONEYPRINTER_ACCESS_CLIENT_ID } : {}),
          ...(env.MONEYPRINTER_ACCESS_CLIENT_SECRET ? { accessClientSecret: env.MONEYPRINTER_ACCESS_CLIENT_SECRET } : {}),
        }));
      }
      return renderers;
    },
    publishers() { const publishers: PublisherProvider[] = [new TikTokPublisher(), new InstagramPublisher(), new YouTubePublisher(), new XPublisher()]; return publishers; },
    credentialVault: new EnvironmentCredentialVault(env),
    contentModel() {
      if (!env.OPENAI_API_KEY || !env.OPENAI_CONTENT_MODEL) return undefined;
      return new OpenAIResponsesTextModel({ apiKey: env.OPENAI_API_KEY, model: env.OPENAI_CONTENT_MODEL });
    },
    metricsProviders(product: ProductBrain) {
      const configs = safeJson<Array<{ name?: string; productId?: string; url: string; bearerToken?: string }>>(env.GROWTH_METRICS_FEEDS_JSON, []);
      const providers: MetricsProvider[] = [];
      for (const config of configs) {
        if (!config?.url || config.productId && config.productId !== product.productId) continue;
        providers.push(new HttpAttributionMetricsProvider({ url: config.url, ...(config.name ? { name: config.name } : {}), ...(config.bearerToken ? { bearerToken: config.bearerToken } : {}) }));
      }
      return providers;
    },
  };
}

function safeJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}
