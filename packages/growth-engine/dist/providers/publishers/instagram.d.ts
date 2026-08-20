import type { PublishRequest, PublishResult } from "../../types";
import type { PublisherProvider, PublishingCredential } from "./interface";
/** Meta/Instagram publisher seam. Enable only after the app/account type and current Graph API publishing flow are verified. */
export declare class InstagramPublisher implements PublisherProvider {
    readonly platform: "instagram";
    publish(_req: PublishRequest, _cred: PublishingCredential): Promise<PublishResult>;
}
