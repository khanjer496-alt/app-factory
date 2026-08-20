export type JobProvider = "greenhouse" | "lever" | "ashby" | "smartrecruiters" | "workday" | "workable" | "company" | "linkedin_signal" | "manual";

export interface NormalizedJob {
  sourceProvider: JobProvider | string;
  sourceKey: string;
  sourceUrl: string;
  applyUrl?: string;
  company: string;
  title: string;
  location?: string;
  workplaceType?: "remote" | "hybrid" | "on-site" | "unspecified" | string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description: string;
  department?: string;
  postedAt?: number;
  raw?: unknown;
}

export interface CareerFact {
  id: string;
  type: string;
  employer?: string | null;
  role?: string | null;
  text: string;
  verification: "verified" | "user_provided" | "inferred" | "unverified";
}

export interface MatchResult {
  score: number;
  experience: number;
  skills: number;
  seniority: number;
  industry: number;
  location: number;
  strengths: string[];
  gaps: string[];
  explanation: string;
}

export interface TailoredResume {
  headline: string;
  summary: string;
  experience: Array<{ employer: string; role: string; bullets: string[] }>;
  skills: string[];
  changeSummary: string[];
}

export interface TruthIssue { claim: string; reason: string; supported: boolean; supportingFactIds: string[]; }
export interface TruthResult { status: "passed" | "failed" | "needs_review"; issues: TruthIssue[]; }

export interface ApplicationQueueMessage { applicationId: string; userId: string; jobId: string; attempt: number; }
