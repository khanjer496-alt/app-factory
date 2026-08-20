import type { GrowthRuntime } from "../runtime";
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
export declare function createCloudflareGrowthRuntime(env: GrowthWorkflowEnv): GrowthRuntime;
