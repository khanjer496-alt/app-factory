import type { NormalizedJob } from "../types";
export interface JobSourceAdapter {
  provider: string;
  fetchJobs(identifier: string): Promise<NormalizedJob[]>;
}
