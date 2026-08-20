import type { JobSourceAdapter } from "./interface";
import type { NormalizedJob } from "../types";
import { cleanText } from "../util";

export class AshbySource implements JobSourceAdapter {
  provider = "ashby";
  async fetchJobs(boardName: string): Promise<NormalizedJob[]> {
    const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(boardName)}?includeCompensation=true`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Ashby ${res.status}`);
    const data = await res.json() as { jobs?: any[] };
    return (data.jobs || []).filter(j => j.isListed !== false).map((j): NormalizedJob => ({
      sourceProvider: this.provider,
      sourceKey: String(j.id || j.jobUrl || j.applyUrl),
      sourceUrl: String(j.jobUrl || j.applyUrl || ""),
      applyUrl: String(j.applyUrl || j.jobUrl || ""),
      company: boardName,
      title: String(j.title || "Untitled role"),
      location: String(j.location || ""),
      workplaceType: j.isRemote ? "remote" : undefined,
      employmentType: String(j.employmentType || ""),
      department: String(j.department || j.team || ""),
      description: cleanText(j.descriptionPlain || j.descriptionHtml || j.description || ""),
      raw: j,
    }));
  }
}
