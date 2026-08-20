import type { Env } from "../env";
import type { NormalizedJob, CareerFact } from "./types";
import { now } from "./util";

function jobId(job: NormalizedJob): string { return crypto.randomUUID(); }

export async function upsertJob(env: Env, job: NormalizedJob): Promise<string> {
  const existing = await env.DB.prepare("SELECT id FROM jobs WHERE source_provider=? AND source_key=?").bind(job.sourceProvider, job.sourceKey).first<{id:string}>();
  const id = existing?.id || jobId(job);
  const ts = now();
  await env.DB.prepare(`INSERT INTO jobs(id,source_provider,source_key,source_url,apply_url,company,title,location,workplace_type,employment_type,salary_min,salary_max,salary_currency,description,department,posted_at,discovered_at,last_seen_at,raw_json)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(source_provider,source_key) DO UPDATE SET source_url=excluded.source_url,apply_url=excluded.apply_url,company=excluded.company,title=excluded.title,location=excluded.location,workplace_type=excluded.workplace_type,employment_type=excluded.employment_type,salary_min=excluded.salary_min,salary_max=excluded.salary_max,salary_currency=excluded.salary_currency,description=excluded.description,department=excluded.department,posted_at=excluded.posted_at,last_seen_at=excluded.last_seen_at,raw_json=excluded.raw_json`)
    .bind(id,job.sourceProvider,job.sourceKey,job.sourceUrl,job.applyUrl||null,job.company,job.title,job.location||null,job.workplaceType||null,job.employmentType||null,job.salaryMin??null,job.salaryMax??null,job.salaryCurrency||null,job.description,job.department||null,job.postedAt??null,ts,ts,JSON.stringify(job.raw??{})).run();
  return id;
}

export async function careerFacts(env: Env, userId: string): Promise<CareerFact[]> {
  const r=await env.DB.prepare("SELECT id,type,employer,role,text,verification FROM career_facts WHERE user_id=? AND verification IN ('verified','user_provided') ORDER BY updated_at DESC").bind(userId).all<CareerFact>();
  return r.results;
}

export async function recordAiUsage(env:Env, args:{userId?:string;jobId?:string;applicationId?:string;operation:string;model:string;inputTokens?:number;outputTokens?:number;cost?:number}) {
  await env.DB.prepare("INSERT INTO job_ai_usage(id,user_id,job_id,application_id,operation,model,input_tokens,output_tokens,estimated_cost_usd,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)")
    .bind(crypto.randomUUID(),args.userId||null,args.jobId||null,args.applicationId||null,args.operation,args.model,args.inputTokens??null,args.outputTokens??null,args.cost??0,now()).run();
}
