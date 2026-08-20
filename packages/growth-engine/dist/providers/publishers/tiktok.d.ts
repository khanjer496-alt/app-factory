import type { PublishRequest, PublishResult } from "../../types";
import type { PublisherProvider, PublishingCredential } from "./interface";
export declare class TikTokPublisher implements PublisherProvider {
    readonly platform: "tiktok";
    publish(req: PublishRequest, cred: PublishingCredential): Promise<PublishResult>;
}
