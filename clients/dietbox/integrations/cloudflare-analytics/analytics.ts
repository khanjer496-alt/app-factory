/**
 * Cloudflare-first product analytics adapter.
 *
 * Use Cloudflare Web Analytics for page views / RUM and Workers Analytics
 * Engine for first-party product/business events. Product code should depend
 * on this adapter rather than a vendor-specific analytics SDK.
 *
 * Keep event payloads pseudonymous. Do not write email addresses, names,
 * auth tokens, CV text, message bodies, or other sensitive payloads.
 */

export interface AnalyticsEngineDataPoint {
  indexes?: string[];
  blobs?: string[];
  doubles?: number[];
}

export interface AnalyticsEngineBinding {
  writeDataPoint(point: AnalyticsEngineDataPoint): void;
}

export type ProductEventName =
  | "signed_up"
  | "onboarding_completed"
  | "feature_used"
  | "checkout_started"
  | "subscription_started"
  | "subscription_cancelled"
  | "ai_operation"
  | "api_operation"
  | "workflow_completed"
  | "workflow_failed"
  | string;

export interface ProductEvent {
  /** Stable pseudonymous key, e.g. internal UUID; never email/name. */
  actorKey?: string;
  name: ProductEventName;
  product: string;
  environment: "development" | "preview" | "production" | string;
  routeOrFeature?: string;
  plan?: string;
  source?: string;
  value?: number;
  durationMs?: number;
  estimatedCostUsd?: number;
}

export interface AnalyticsServiceOptions {
  binding: AnalyticsEngineBinding;
  anonymousIndex?: string;
}

function clean(value: string | undefined, max = 256): string {
  return (value ?? "").replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, max);
}

export function createCloudflareAnalytics(options: AnalyticsServiceOptions) {
  const anonymousIndex = options.anonymousIndex ?? "anonymous";

  return {
    track(event: ProductEvent): void {
      // Analytics Engine currently supports one index per point. Use the
      // pseudonymous actor key for per-user/account aggregation where needed.
      options.binding.writeDataPoint({
        indexes: [clean(event.actorKey || anonymousIndex, 96)],
        blobs: [
          clean(event.name),
          clean(event.product),
          clean(event.environment),
          clean(event.routeOrFeature),
          clean(event.plan),
          clean(event.source),
        ],
        doubles: [
          event.value ?? 0,
          event.durationMs ?? 0,
          event.estimatedCostUsd ?? 0,
        ],
      });
    },
  };
}
