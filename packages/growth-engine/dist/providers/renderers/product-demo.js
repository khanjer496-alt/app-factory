/** Provider seam for a browser recorder running against a dedicated demo account. */
export class ProductDemoRenderer {
    name = "product-demo";
    supports(format) { return format === "product_demo"; }
    async start(_request) {
        return { provider: this.name, status: "failed", error: "Configure a browser/demo recording provider" };
    }
}
//# sourceMappingURL=product-demo.js.map