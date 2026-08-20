import type { RenderRequest, RenderResult } from "../../types";
import type { RendererProvider } from "./interface";
/**
 * Provider seam for a real slideshow renderer. Keep the orchestration stable while
 * the implementation can be Browser Rendering, Remotion on a compute host, or another service.
 */
export declare class SlideshowRenderer implements RendererProvider {
    readonly name = "slideshow";
    supports(format: RenderRequest["idea"]["format"]): format is "slideshow";
    start(_request: RenderRequest): Promise<RenderResult>;
}
