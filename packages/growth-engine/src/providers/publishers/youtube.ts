import type { PublishRequest, PublishResult } from "../../types";
import type { PublisherProvider, PublishingCredential } from "./interface";

/**
 * YouTube video upload is a media/multipart or resumable upload. This seam keeps
 * OAuth and the official videos.insert workflow isolated from the rest of the engine.
 */
export class YouTubePublisher implements PublisherProvider {
  readonly platform = "youtube" as const;
  async publish(_req: PublishRequest, _cred: PublishingCredential): Promise<PublishResult> {
    return {
      provider: this.platform,
      status: "needs_review",
      error: "Implement resumable videos.insert upload with youtube.upload OAuth scope before enabling",
    };
  }
}
