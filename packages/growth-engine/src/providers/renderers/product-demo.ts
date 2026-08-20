import type { RenderRequest, RenderResult } from "../../types";
import type { RendererProvider } from "./interface";

/** Provider seam for a browser recorder running against a dedicated demo account. */
export class ProductDemoRenderer implements RendererProvider {
  readonly name = "product-demo";
  supports(format: RenderRequest["idea"]["format"]) { return format === "product_demo"; }
  async start(_request: RenderRequest): Promise<RenderResult> {
    return { provider: this.name, status: "failed", error: "Configure a browser/demo recording provider" };
  }
}
