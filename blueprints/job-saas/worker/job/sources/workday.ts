import type { Env } from "../../env";
import type { JobSourceAdapter } from "./interface";
import type { NormalizedJob } from "../types";
import { cleanText } from "../util";

/**
 * Workday is a first-class source, but not through an assumed private employer API.
 * This adapter delegates public candidate-site discovery to the configured browser
 * discovery service (Browser Run / Playwright provider) and normalizes the result.
 */
export class WorkdaySource implements JobSourceAdapter {
  provider = "workday";
  constructor(private env: Env) {}

  async fetchJobs(careerSiteUrl: string): Promise<NormalizedJob[]> {
    if (!this.env.JOB_DISCOVERY_AUTOMATION_ENDPOINT) {
      throw new Error("Workday discovery requires JOB_DISCOVERY_AUTOMATION_ENDPOINT");
    }
    const res = await fetch(this.env.JOB_DISCOVERY_AUTOMATION_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.env.JOB_DISCOVERY_AUTOMATION_TOKEN || ""}`,
      },
      body: JSON.stringify({ provider: "workday", careerSiteUrl, limit: 100 }),
    });
    if (!res.ok) throw new Error(`Workday discovery ${res.status}`);
    const data = await res.json() as { jobs?: any[] };
    return (data.jobs || []).slice(0, 100).map((j, i): NormalizedJob => ({
      sourceProvider: this.provider,
      sourceKey: String(j.id || j.externalPath || j.applyUrl || j.url || `${careerSiteUrl}:${i}`),
      sourceUrl: String(j.url || j.applyUrl || careerSiteUrl),
      applyUrl: String(j.applyUrl || j.url || careerSiteUrl),
      company: String(j.company || j.companyName || "Workday employer"),
      title: String(j.title || "Untitled role"),
      location: String(j.location || ""),
      workplaceType: j.workplaceType || "unspecified",
      employmentType: j.employmentType ? String(j.employmentType) : undefined,
      salaryMin: Number.isFinite(Number(j.salaryMin)) ? Number(j.salaryMin) : undefined,
      salaryMax: Number.isFinite(Number(j.salaryMax)) ? Number(j.salaryMax) : undefined,
      salaryCurrency: j.salaryCurrency ? String(j.salaryCurrency) : undefined,
      description: cleanText(j.description || ""),
      department: j.department ? String(j.department) : undefined,
      postedAt: j.postedAt ? Number(j.postedAt) || Date.parse(String(j.postedAt)) : undefined,
      raw: j,
    }));
  }
}
