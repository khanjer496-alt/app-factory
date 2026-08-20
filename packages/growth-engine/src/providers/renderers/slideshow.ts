import type { RenderRequest, RenderResult } from "../../types";
import type { RendererProvider } from "./interface";

/**
 * Provider seam for a real slideshow renderer. Keep the orchestration stable while
 * the implementation can be Browser Rendering, Remotion on a compute host, or another service.
 */
export class SlideshowRenderer implements RendererProvider {
  readonly name = "slideshow";
  supports(format: RenderRequest["idea"]["format"]) { return format === "slideshow"; }
  async start(_request: RenderRequest): Promise<RenderResult> {
    return { provider: this.name, status: "failed", error: "Configure a slideshow rendering provider" };
  }
}
