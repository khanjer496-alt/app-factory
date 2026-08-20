/** Meta/Instagram publisher seam. Enable only after the app/account type and current Graph API publishing flow are verified. */
export class InstagramPublisher {
    platform = "instagram";
    async publish(_req, _cred) {
        return { provider: this.platform, status: "needs_review", error: "Configure current Meta Instagram publishing flow before enabling" };
    }
}
//# sourceMappingURL=instagram.js.map