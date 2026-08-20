import type { JobSourceAdapter } from "./interface";
import type { NormalizedJob } from "../types";
import { cleanText } from "../util";

export class SmartRecruitersSource implements JobSourceAdapter {
  provider = "smartrecruiters";
  async fetchJobs(companyIdentifier: string): Promise<NormalizedJob[]> {
    const url = `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(companyIdentifier)}/postings?limit=100&destination=PUBLIC`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`SmartRecruiters ${res.status}`);
    const data = await res.json() as any;
    const rows = data.content || data.postings || [];
    return rows.map((j:any): NormalizedJob => ({
      sourceProvider: this.provider,
      sourceKey: String(j.id || j.uuid),
      sourceUrl: String(j.ref || j.url || j.applyUrl || ""),
      applyUrl: String(j.applyUrl || j.ref || j.url || ""),
      company: String(j.company?.name || companyIdentifier),
      title: String(j.name || j.title || "Untitled role"),
      location: String(j.location?.city || j.location?.fullLocation || j.location || ""),
      employmentType: String(j.typeOfEmployment?.label || j.typeOfEmployment || ""),
      department: String(j.department?.label || j.department || ""),
      description: cleanText(j.jobAd?.sections?.jobDescription?.text || j.description || ""),
      raw: j,
    }));
  }
}
