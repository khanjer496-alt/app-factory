import type { PublishRequest, PublishResult } from "../../types";
import type { PublisherProvider, PublishingCredential } from "./interface";

/** Meta/Instagram publisher seam. Enable only after the app/account type and current Graph API publishing flow are verified. */
export class InstagramPublisher implements PublisherProvider {
  readonly platform = "instagram" as const;
  async publish(_req: PublishRequest, _cred: PublishingCredential): Promise<PublishResult> {
    return { provider: this.platform, status: "needs_review", error: "Configure current Meta Instagram publishing flow before enabling" };
  }
}
