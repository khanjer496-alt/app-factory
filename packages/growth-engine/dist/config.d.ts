import type { AutonomyMode, Platform } from "./types";
export interface GrowthPolicy {
    autonomyMode: AutonomyMode;
    defaultDailyPublishCap: number;
    defaultDailySpendUsd: number;
    minAutoPublishConfidence: number;
    alwaysReviewFormats: string[];
    enabledPlatforms: Platform[];
}
export declare const defaultGrowthPolicy: GrowthPolicy;
