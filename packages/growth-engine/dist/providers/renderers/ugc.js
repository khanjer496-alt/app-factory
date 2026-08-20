/** Provider seam for a consent/disclosure-compliant avatar/UGC vendor. */
export class UGCRenderer {
    name = "ugc-avatar";
    supports(format) { return format === "ugc_avatar"; }
    async start(_request) {
        return { provider: this.name, status: "failed", error: "Configure a UGC/avatar provider" };
    }
}
//# sourceMappingURL=ugc.js.map