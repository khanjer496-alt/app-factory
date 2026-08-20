/**
 * Provider seam for a real slideshow renderer. Keep the orchestration stable while
 * the implementation can be Browser Rendering, Remotion on a compute host, or another service.
 */
export class SlideshowRenderer {
    name = "slideshow";
    supports(format) { return format === "slideshow"; }
    async start(_request) {
        return { provider: this.name, status: "failed", error: "Configure a slideshow rendering provider" };
    }
}
//# sourceMappingURL=slideshow.js.map