import type { PublishRequest, PublishResult } from "../../types";
import type { PublisherProvider, PublishingCredential } from "./interface";

export class XPublisher implements PublisherProvider {
  readonly platform = "x" as const;
  async publish(req: PublishRequest, cred: PublishingCredential): Promise<PublishResult> {
    if (req.mediaUrl) {
      return { provider: this.platform, status: "needs_review", error: "Configure X media upload before media Posts" };
    }
    const res = await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: { Authorization: `Bearer ${cred.accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: req.text }),
    });
    const payload = (await res.json()) as any;
    if (!res.ok) return { provider: this.platform, status: "failed", error: payload?.detail ?? `X ${res.status}` };
    return { provider: this.platform, status: "published", externalPostId: payload?.data?.id };
  }
}
