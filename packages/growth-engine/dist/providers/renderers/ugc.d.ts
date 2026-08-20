import type { RenderRequest, RenderResult } from "../../types";
import type { RendererProvider } from "./interface";
/** Provider seam for a consent/disclosure-compliant avatar/UGC vendor. */
export declare class UGCRenderer implements RendererProvider {
    readonly name = "ugc-avatar";
    supports(format: RenderRequest["idea"]["format"]): format is "ugc_avatar";
    start(_request: RenderRequest): Promise<RenderResult>;
}
