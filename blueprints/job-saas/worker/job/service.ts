import type { Env } from "../env";
import type { NormalizedJob } from "./types";
import { careerFacts, recordAiUsage } from "./store";
import { scoreJob } from "./ai/match";
import { tailorResume, verifyResume } from "./ai/resume";
import { now } from "./util";

export function dbJobToNormalized(j:any):NormalizedJob{return {sourceProvider:j.source_provider,sourceKey:j.source_key,sourceUrl:j.source_url,applyUrl:j.apply_url,company:j.company,title:j.title,location:j.location,workplaceType:j.workplace_type,employmentType:j.employment_type,salaryMin:j.salary_min,salaryMax:j.salary_max,salaryCurrency:j.salary_currency,description:j.description,department:j.department,postedAt:j.posted_at}}

export async function scoreAndPersist(env:Env,userId:string,jobId:string,searchId?:string|null){
  const j=await env.DB.prepare("SELECT * FROM jobs WHERE id=?").bind(jobId).first<any>();if(!j)throw new Error("Job not found");
  const facts=await careerFacts(env,userId);if(!facts.length)throw new Error("Add verified/user-provided career facts first");
  const scored=await scoreJob(env,facts,dbJobToNormalized(j));const id=crypto.randomUUID(),ts=now();
  await env.DB.prepare(`INSERT INTO job_matches(id,user_id,job_id,search_id,score,experience_score,skills_score,seniority_score,industry_score,location_score,strengths_json,gaps_json,explanation,model,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(user_id,job_id) DO UPDATE SET search_id=COALESCE(excluded.search_id,job_matches.search_id),score=excluded.score,experience_score=excluded.experience_score,skills_score=excluded.skills_score,seniority_score=excluded.seniority_score,industry_score=excluded.industry_score,location_score=excluded.location_score,strengths_json=excluded.strengths_json,gaps_json=excluded.gaps_json,explanation=excluded.explanation,model=excluded.model,updated_at=excluded.updated_at`)
    .bind(id,userId,j.id,searchId||null,scored.result.score,scored.result.experience,scored.result.skills,scored.result.seniority,scored.result.industry,scored.result.location,JSON.stringify(scored.result.strengths),JSON.stringify(scored.result.gaps),scored.result.explanation,scored.model,ts,ts).run();
  await recordAiUsage(env,{userId,jobId:j.id,operation:"job_score",model:scored.model,inputTokens:scored.inputTokens,outputTokens:scored.outputTokens,cost:scored.estimatedCostUsd});return scored.result;
}

export async function prepareAndPersist(env:Env,userId:string,jobId:string){
  const j=await env.DB.prepare("SELECT * FROM jobs WHERE id=?").bind(jobId).first<any>();if(!j)throw new Error("Job not found");
  const facts=await careerFacts(env,userId);if(!facts.length)throw new Error("Career Brain is empty");
  const tailored=await tailorResume(env,facts,dbJobToNormalized(j));const truth=await verifyResume(env,facts,tailored.data);const resumeId=crypto.randomUUID(),ts=now();
  await env.DB.prepare("INSERT INTO resume_versions(id,user_id,job_id,content_json,change_summary_json,truth_status,truth_issues_json,model,created_at) VALUES(?,?,?,?,?,?,?,?,?)").bind(resumeId,userId,j.id,JSON.stringify(tailored.data),JSON.stringify(tailored.data.changeSummary),truth.data.status,JSON.stringify(truth.data.issues),tailored.model,ts).run();
  const match=await env.DB.prepare("SELECT id FROM job_matches WHERE user_id=? AND job_id=?").bind(userId,j.id).first<{id:string}>();const candidateId=crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO applications(id,user_id,job_id,match_id,resume_version_id,status,submit_mode,unresolved_questions,updated_at,created_at) VALUES(?,?,?,?,?,'package_ready','review',0,?,?) ON CONFLICT(user_id,job_id) DO UPDATE SET resume_version_id=excluded.resume_version_id,status='package_ready',updated_at=excluded.updated_at`).bind(candidateId,userId,j.id,match?.id||null,resumeId,ts,ts).run();
  const app=await env.DB.prepare("SELECT id FROM applications WHERE user_id=? AND job_id=?").bind(userId,j.id).first<{id:string}>();
  await recordAiUsage(env,{userId,jobId:j.id,applicationId:app?.id,operation:"resume_tailor",model:tailored.model,inputTokens:tailored.inputTokens,outputTokens:tailored.outputTokens,cost:tailored.estimatedCostUsd});
  await recordAiUsage(env,{userId,jobId:j.id,applicationId:app?.id,operation:"truth_check",model:truth.model,inputTokens:truth.inputTokens,outputTokens:truth.outputTokens,cost:truth.estimatedCostUsd});
  return {applicationId:app?.id,resumeId,resume:tailored.data,truth:truth.data};
}
