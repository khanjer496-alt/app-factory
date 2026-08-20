import type { Platform, PublishRequest, PublishResult } from "../../types";
export interface PublishingCredential {
    connectionId: string;
    platform: Platform;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: string;
    metadata?: Record<string, string>;
}
export interface PublisherProvider {
    readonly platform: Platform;
    publish(request: PublishRequest, credential: PublishingCredential): Promise<PublishResult>;
}
