export type AutonomyMode = "review" | "assisted" | "autopilot";

export type ContentFormat =
  | "faceless_video"
  | "slideshow"
  | "product_demo"
  | "ugc_avatar"
  | "image_post"
  | "text_post";

export type Platform = "tiktok" | "instagram" | "youtube" | "x" | "linkedin";
export type LanguageCode = "en" | "ar" | string;

export interface ProductBrain {
  productId: string;
  name: string;
  domain: string;
  oneLiner: string;
  audiences: string[];
  positioning: string[];
  contentPillars: string[];
  allowedClaims: string[];
  prohibitedClaims: string[];
  languages: LanguageCode[];
  ctas: Array<{ label: string; url: string }>;
  brand: {
    voice: string[];
    avoid: string[];
    logoR2Key?: string;
    accent?: string;
  };
  autonomy: {
    mode: AutonomyMode;
    maxPublishesPerDay: number;
    maxSpendUsdPerDay: number;
    minAutoPublishConfidence: number;
  };
}

export interface TrendSignal {
  id: string;
  source: string;
  observedAt: string;
  region?: string;
  language?: string;
  platform?: Platform | string;
  format?: string;
  category?: string;
  text: string;
  url?: string;
  keywords: string[];
  relatedTerms?: string[];
  velocity?: number;
  volume?: number;
  engagementRate?: number;
  confidence: number;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ScoredTrendSignal extends TrendSignal {
  trendScore: number;
  productRelevance: number;
  freshness: number;
  reasons: string[];
}

export interface TrendScoutReport {
  productId: string;
  runId: string;
  startedAt: string;
  completedAt: string;
  providers: Array<{ name: string; collected: number; error?: string }>;
  rawCount: number;
  dedupedCount: number;
  selected: ScoredTrendSignal[];
}

export interface ContentIdea {
  id: string;
  productId: string;
  sourceTrendIds: string[];
  hook: string;
  angle: string;
  format: ContentFormat;
  language: LanguageCode;
  script?: string;
  visualPlan?: string[];
  cta?: string;
  score: number;
  confidence: number;
  risk: "low" | "medium" | "high";
  rationale?: string;
  experimentGroup?: string;
  metadata?: Record<string, unknown>;
}

export interface ContentExperiment {
  id: string;
  productId: string;
  hypothesis: string;
  sourceIdeaId: string;
  variants: ContentIdea[];
  primaryMetric: "views" | "watch_time" | "clicks" | "signups" | "paid_conversions" | "revenue";
  status: "draft" | "running" | "completed" | "stopped";
}

export interface ContentBrainReport {
  productId: string;
  runId: string;
  generatedAt: string;
  trendsUsed: string[];
  ideas: ContentIdea[];
  experiments: ContentExperiment[];
  model?: string;
  fallbackUsed: boolean;
}

export interface PerformanceLearning {
  key: string;
  value: string;
  confidence: number;
  evidenceCount: number;
}

export interface RenderRequest {
  id: string;
  productId: string;
  idea: ContentIdea;
  aspectRatio: "9:16" | "1:1" | "16:9";
  assetUrls?: string[];
  outputR2Prefix: string;
}

export interface RenderResult {
  provider: string;
  providerJobId?: string;
  status: "queued" | "rendering" | "completed" | "failed";
  mediaUrl?: string;
  mediaR2Key?: string;
  durationSeconds?: number;
  costUsd?: number;
  error?: string;
}

export interface PublishRequest {
  contentId: string;
  productId: string;
  platform: Platform;
  connectionId: string;
  mediaUrl?: string;
  text: string;
  title?: string;
  scheduledAt?: string;
  metadata?: Record<string, unknown>;
}

export interface PublishResult {
  provider: Platform;
  status: "queued" | "published" | "failed" | "needs_review";
  externalPostId?: string;
  externalUrl?: string;
  error?: string;
}

export interface QAIssue {
  code: string;
  severity: "info" | "warn" | "block";
  message: string;
}

export interface QAResult {
  passed: boolean;
  autoPublishEligible: boolean;
  issues: QAIssue[];
}
