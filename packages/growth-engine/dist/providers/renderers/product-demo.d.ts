import type { RenderRequest, RenderResult } from "../../types";
import type { RendererProvider } from "./interface";
/** Provider seam for a browser recorder running against a dedicated demo account. */
export declare class ProductDemoRenderer implements RendererProvider {
    readonly name = "product-demo";
    supports(format: RenderRequest["idea"]["format"]): format is "product_demo";
    start(_request: RenderRequest): Promise<RenderResult>;
}
