import type { JobSourceAdapter } from "./interface";
import type { NormalizedJob } from "../types";
import { cleanText } from "../util";

export class GreenhouseSource implements JobSourceAdapter {
  provider = "greenhouse";
  async fetchJobs(boardToken: string): Promise<NormalizedJob[]> {
    const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}/jobs?content=true`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Greenhouse ${res.status}`);
    const data = await res.json() as { jobs?: any[] };
    return (data.jobs || []).map((j): NormalizedJob => ({
      sourceProvider: this.provider,
      sourceKey: String(j.id),
      sourceUrl: String(j.absolute_url || ""),
      applyUrl: String(j.absolute_url || ""),
      company: String(j.company_name || boardToken),
      title: String(j.title || "Untitled role"),
      location: String(j.location?.name || ""),
      description: cleanText(j.content),
      department: Array.isArray(j.departments) ? j.departments.map((x:any)=>x.name).filter(Boolean).join(", ") : undefined,
      postedAt: j.updated_at ? Date.parse(j.updated_at) : undefined,
      raw: j,
    }));
  }
}
