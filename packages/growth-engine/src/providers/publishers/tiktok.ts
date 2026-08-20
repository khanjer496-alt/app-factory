import type { PublishRequest, PublishResult } from "../../types";
import type { PublisherProvider, PublishingCredential } from "./interface";

export class TikTokPublisher implements PublisherProvider {
  readonly platform = "tiktok" as const;

  async publish(req: PublishRequest, cred: PublishingCredential): Promise<PublishResult> {
    if (!req.mediaUrl) return { provider: this.platform, status: "failed", error: "TikTok requires media" };

    const isPhoto = req.metadata?.mediaType === "photo";
    const endpoint = isPhoto
      ? "https://open.tiktokapis.com/v2/post/publish/content/init/"
      : "https://open.tiktokapis.com/v2/post/publish/video/init/";

    // Production code must first query creator_info and use a permitted privacy_level.
    // This adapter intentionally requires caller-provided metadata after that step.
    const privacy = req.metadata?.privacyLevel;
    if (typeof privacy !== "string") {
      return { provider: this.platform, status: "needs_review", error: "creator_info/privacy selection required" };
    }

    const body = isPhoto
      ? {
          post_mode: "DIRECT_POST",
          media_type: "PHOTO",
          post_info: { title: req.title ?? "", description: req.text, privacy_level: privacy },
          source_info: { source: "PULL_FROM_URL", photo_cover_index: 0, photo_images: [req.mediaUrl] },
        }
      : {
          post_info: { title: req.text, privacy_level: privacy },
          source_info: { source: "PULL_FROM_URL", video_url: req.mediaUrl },
        };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${cred.accessToken}`, "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(body),
    });
    const payload = (await res.json()) as any;
    if (!res.ok || payload?.error?.code && payload.error.code !== "ok") {
      return { provider: this.platform, status: "failed", error: payload?.error?.message ?? `TikTok ${res.status}` };
    }
    return { provider: this.platform, status: "queued", externalPostId: payload?.data?.publish_id };
  }
}
