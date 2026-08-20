export class MoneyPrinterRenderer {
    config;
    name = "moneyprinterturbo";
    constructor(config) {
        this.config = config;
    }
    supports(format) {
        return format === "faceless_video";
    }
    headers() {
        const h = { "content-type": "application/json" };
        if (this.config.accessClientId && this.config.accessClientSecret) {
            h["CF-Access-Client-Id"] = this.config.accessClientId;
            h["CF-Access-Client-Secret"] = this.config.accessClientSecret;
        }
        return h;
    }
    async start(request) {
        const script = request.idea.script || request.idea.hook;
        const body = {
            video_subject: request.idea.angle,
            video_script: script,
            video_aspect: request.aspectRatio,
            video_count: 1,
            paragraph_number: 1,
        };
        const res = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/api/v1/videos`, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify(body),
        });
        if (!res.ok)
            return { provider: this.name, status: "failed", error: `MPT ${res.status}` };
        const payload = (await res.json());
        const taskId = payload?.data?.task_id ?? payload?.task_id;
        if (!taskId)
            return { provider: this.name, status: "failed", error: "MoneyPrinterTurbo returned no task_id" };
        return { provider: this.name, providerJobId: String(taskId), status: "queued" };
    }
    async status(providerJobId) {
        const res = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/api/v1/tasks/${encodeURIComponent(providerJobId)}`, {
            headers: this.headers(),
        });
        if (!res.ok)
            return { provider: this.name, providerJobId, status: "failed", error: `MPT ${res.status}` };
        const payload = (await res.json());
        const task = payload?.data ?? payload;
        const state = String(task?.state ?? task?.status ?? "").toLowerCase();
        const videos = task?.videos;
        if (videos?.length) {
            const mediaUrl = videos[0];
            return mediaUrl
                ? { provider: this.name, providerJobId, status: "completed", mediaUrl }
                : { provider: this.name, providerJobId, status: "rendering" };
        }
        if (["failed", "error"].includes(state)) {
            return { provider: this.name, providerJobId, status: "failed", error: task?.error ?? "render failed" };
        }
        return { provider: this.name, providerJobId, status: "rendering" };
    }
}
//# sourceMappingURL=moneyprinter.js.map