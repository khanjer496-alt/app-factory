/**
 * YouTube video upload is a media/multipart or resumable upload. This seam keeps
 * OAuth and the official videos.insert workflow isolated from the rest of the engine.
 */
export class YouTubePublisher {
    platform = "youtube";
    async publish(_req, _cred) {
        return {
            provider: this.platform,
            status: "needs_review",
            error: "Implement resumable videos.insert upload with youtube.upload OAuth scope before enabling",
        };
    }
}
//# sourceMappingURL=youtube.js.map