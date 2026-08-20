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
import { HttpAttributionMetricsProvider } from "../providers/metrics/http-attribution";
class EnvironmentCredentialVault {
    env;
    constructor(env) {
        this.env = env;
    }
    async resolve(connection) {
        // Starter implementation only. In production replace with a dedicated encrypted
        // credential/secrets service while keeping credential_ref in D1.
        const map = safeJson(this.env.SOCIAL_CREDENTIALS_JSON, {});
        const value = map[connection.credentialRef];
        if (!value?.accessToken)
            throw new Error(`Missing credential for ${connection.credentialRef}`);
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
export function createCloudflareGrowthRuntime(env) {
    return {
        trendProviders(product) {
            const providers = [];
            if (env.YOUTUBE_API_KEY)
                providers.push(new YouTubeTrendProvider({ apiKey: env.YOUTUBE_API_KEY }));
            if (env.GROWTH_ENABLE_GOOGLE_TRENDS !== "false")
                providers.push(createGoogleTrendsProvider());
            if (env.OPENAI_API_KEY && env.OPENAI_TREND_MODEL) {
                providers.push(new OpenAIWebTrendProvider({ apiKey: env.OPENAI_API_KEY, model: env.OPENAI_TREND_MODEL, maxSignals: 20 }));
            }
            const feeds = safeJson(env.GROWTH_RSS_FEEDS_JSON, []);
            for (const feed of feeds) {
                if (!feed?.name || !feed?.url)
                    continue;
                providers.push(new RssTrendProvider({ name: feed.name, feedUrl: () => feed.url, ...(feed.confidence != null ? { defaultConfidence: feed.confidence } : {}) }));
            }
            return providers;
        },
        renderers() {
            const renderers = [new SlideshowRenderer(), new ProductDemoRenderer(), new UGCRenderer()];
            if (env.MONEYPRINTER_URL) {
                renderers.unshift(new MoneyPrinterRenderer({
                    baseUrl: env.MONEYPRINTER_URL,
                    ...(env.MONEYPRINTER_ACCESS_CLIENT_ID ? { accessClientId: env.MONEYPRINTER_ACCESS_CLIENT_ID } : {}),
                    ...(env.MONEYPRINTER_ACCESS_CLIENT_SECRET ? { accessClientSecret: env.MONEYPRINTER_ACCESS_CLIENT_SECRET } : {}),
                }));
            }
            return renderers;
        },
        publishers() { const publishers = [new TikTokPublisher(), new InstagramPublisher(), new YouTubePublisher(), new XPublisher()]; return publishers; },
        credentialVault: new EnvironmentCredentialVault(env),
        contentModel() {
            if (!env.OPENAI_API_KEY || !env.OPENAI_CONTENT_MODEL)
                return undefined;
            return new OpenAIResponsesTextModel({ apiKey: env.OPENAI_API_KEY, model: env.OPENAI_CONTENT_MODEL });
        },
        metricsProviders(product) {
            const configs = safeJson(env.GROWTH_METRICS_FEEDS_JSON, []);
            const providers = [];
            for (const config of configs) {
                if (!config?.url || config.productId && config.productId !== product.productId)
                    continue;
                providers.push(new HttpAttributionMetricsProvider({ url: config.url, ...(config.name ? { name: config.name } : {}), ...(config.bearerToken ? { bearerToken: config.bearerToken } : {}) }));
            }
            return providers;
        },
    };
}
function safeJson(value, fallback) {
    if (!value)
        return fallback;
    try {
        return JSON.parse(value);
    }
    catch {
        return fallback;
    }
}
//# sourceMappingURL=runtime.js.map