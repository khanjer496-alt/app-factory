import type { JobSourceAdapter } from "./interface";
import type { NormalizedJob } from "../types";
import { cleanText } from "../util";

export class LeverSource implements JobSourceAdapter {
  provider = "lever";
  async fetchJobs(site: string): Promise<NormalizedJob[]> {
    const url = `https://api.lever.co/v0/postings/${encodeURIComponent(site)}?mode=json`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Lever ${res.status}`);
    const rows = await res.json() as any[];
    return rows.map((j): NormalizedJob => ({
      sourceProvider: this.provider,
      sourceKey: String(j.id),
      sourceUrl: String(j.hostedUrl || ""),
      applyUrl: String(j.applyUrl || j.hostedUrl || ""),
      company: site,
      title: String(j.text || "Untitled role"),
      location: String(j.categories?.location || ""),
      workplaceType: String(j.workplaceType || "unspecified"),
      employmentType: String(j.categories?.commitment || ""),
      salaryMin: typeof j.salaryRange?.min === "number" ? j.salaryRange.min : undefined,
      salaryMax: typeof j.salaryRange?.max === "number" ? j.salaryRange.max : undefined,
      salaryCurrency: j.salaryRange?.currency,
      department: String(j.categories?.department || j.categories?.team || ""),
      description: cleanText(j.descriptionPlain || j.description || ""),
      raw: j,
    }));
  }
}
