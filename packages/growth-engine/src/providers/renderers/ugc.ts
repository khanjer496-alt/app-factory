import type { RenderRequest, RenderResult } from "../../types";
import type { RendererProvider } from "./interface";

/** Provider seam for a consent/disclosure-compliant avatar/UGC vendor. */
export class UGCRenderer implements RendererProvider {
  readonly name = "ugc-avatar";
  supports(format: RenderRequest["idea"]["format"]) { return format === "ugc_avatar"; }
  async start(_request: RenderRequest): Promise<RenderResult> {
    return { provider: this.name, status: "failed", error: "Configure a UGC/avatar provider" };
  }
}
