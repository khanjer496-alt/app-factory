import type { AutonomyMode, Platform } from "./types";

export interface GrowthPolicy {
  autonomyMode: AutonomyMode;
  defaultDailyPublishCap: number;
  defaultDailySpendUsd: number;
  minAutoPublishConfidence: number;
  alwaysReviewFormats: string[];
  enabledPlatforms: Platform[];
}

export const defaultGrowthPolicy: GrowthPolicy = {
  autonomyMode: "review",
  defaultDailyPublishCap: 6,
  defaultDailySpendUsd: 10,
  minAutoPublishConfidence: 0.92,
  alwaysReviewFormats: ["ugc_avatar"],
  enabledPlatforms: ["tiktok", "instagram", "youtube", "x"],
};
