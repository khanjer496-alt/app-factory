export type JobAgentClientOptions = { baseUrl: string; apiKey: string };

export class JobAgentClient {
  private baseUrl: string;
  private apiKey: string;
  constructor(options: JobAgentClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
  }
  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
        ...(init.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error((body as any).error || `Request failed: ${response.status}`);
    return body as T;
  }
  listJobs(options: { minScore?: number; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (options.minScore != null) q.set("min_score", String(options.minScore));
    if (options.limit != null) q.set("limit", String(options.limit));
    return this.request<{data:any[]}>(`/v1/jobs${q.size ? `?${q}` : ""}`);
  }
  scoreJob(jobId: string) {
    return this.request<{data:any}>(`/v1/jobs/${encodeURIComponent(jobId)}/score`, { method: "POST", body: "{}" });
  }
  tailorResume(jobId: string) {
    return this.request<{data:any}>(`/v1/jobs/${encodeURIComponent(jobId)}/tailor`, { method: "POST", body: "{}" });
  }
  listApplications(limit = 25) {
    return this.request<{data:any[]}>(`/v1/applications?limit=${encodeURIComponent(String(limit))}`);
  }
  getApplication(applicationId: string) {
    return this.request<{data:any}>(`/v1/applications/${encodeURIComponent(applicationId)}`);
  }
  submitApplication(applicationId: string) {
    return this.request<{data:any}>(`/v1/applications/${encodeURIComponent(applicationId)}/submit`, { method: "POST", body: JSON.stringify({ confirm: true }) });
  }
}
