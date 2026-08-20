import type { Env } from "../env";
import { safeJson, now } from "../job/util";
import { scoreAndPersist, prepareAndPersist } from "../job/service";

export async function listAgentJobs(env: Env, userId: string, minScore = 0, limit = 25) {
  const n = Math.max(1, Math.min(100, Number(limit) || 25));
  const r = await env.DB.prepare(`SELECT j.id,j.company,j.title,j.location,j.apply_url,j.source_url,j.source_provider,j.posted_at,
    jm.score,jm.strengths_json,jm.gaps_json,jm.explanation
    FROM jobs j JOIN job_matches jm ON jm.job_id=j.id
    WHERE jm.user_id=? AND jm.score>=?
    ORDER BY jm.score DESC,j.last_seen_at DESC LIMIT ?`).bind(userId, Math.max(0, Math.min(100, Number(minScore)||0)), n).all<any>();
  return r.results.map((x) => ({
    id:x.id, company:x.company, title:x.title, location:x.location, applyUrl:x.apply_url||x.source_url,
    source:x.source_provider, postedAt:x.posted_at, score:x.score,
    strengths:safeJson<string[]>(x.strengths_json,[]), gaps:safeJson<string[]>(x.gaps_json,[]), explanation:x.explanation
  }));
}

export async function getAgentApplication(env: Env, userId: string, id: string) {
  const row = await env.DB.prepare(`SELECT a.id,a.status,a.submit_mode,a.unresolved_questions,a.queued_at,a.submitted_at,a.updated_at,
    j.id job_id,j.company,j.title,j.location,j.apply_url,j.source_url,jm.score,rv.truth_status,rv.content_json,rv.change_summary_json
    FROM applications a JOIN jobs j ON j.id=a.job_id
    LEFT JOIN job_matches jm ON jm.id=a.match_id LEFT JOIN resume_versions rv ON rv.id=a.resume_version_id
    WHERE a.id=? AND a.user_id=?`).bind(id,userId).first<any>();
  if(!row) return null;
  return {
    id:row.id,status:row.status,submitMode:row.submit_mode,unresolvedQuestions:row.unresolved_questions,
    queuedAt:row.queued_at,submittedAt:row.submitted_at,updatedAt:row.updated_at,
    job:{id:row.job_id,company:row.company,title:row.title,location:row.location,applyUrl:row.apply_url||row.source_url,score:row.score},
    resume:row.content_json?{truthStatus:row.truth_status,content:safeJson(row.content_json,{}),changes:safeJson(row.change_summary_json,[])}:null
  };
}

export async function listAgentApplications(env: Env, userId: string, limit = 25) {
  const n=Math.max(1,Math.min(100,Number(limit)||25));
  const r=await env.DB.prepare(`SELECT a.id,a.status,a.unresolved_questions,a.submitted_at,a.updated_at,j.company,j.title,j.location,jm.score
    FROM applications a JOIN jobs j ON j.id=a.job_id LEFT JOIN job_matches jm ON jm.id=a.match_id
    WHERE a.user_id=? ORDER BY a.updated_at DESC LIMIT ?`).bind(userId,n).all<any>();
  return r.results;
}

export async function scoreAgentJob(env: Env, userId: string, jobId: string) {
  return scoreAndPersist(env,userId,jobId,null);
}

export async function prepareAgentApplication(env: Env, userId: string, jobId: string) {
  return prepareAndPersist(env,userId,jobId);
}

export async function queueAgentApplication(env: Env, userId: string, applicationId: string, confirmed: boolean) {
  if(!confirmed) throw new Error("Explicit confirmation is required before submission");
  const app=await env.DB.prepare("SELECT id,job_id,status,unresolved_questions,resume_version_id FROM applications WHERE id=? AND user_id=?")
    .bind(applicationId,userId).first<any>();
  if(!app) throw new Error("Application not found");
  if(!["package_ready","ready_for_review","failed"].includes(app.status)) throw new Error(`Cannot submit from ${app.status}`);
  if(Number(app.unresolved_questions||0)>0) throw new Error("Application has unresolved questions");
  if(!app.resume_version_id) throw new Error("Tailored resume is missing");
  const resume=await env.DB.prepare("SELECT truth_status FROM resume_versions WHERE id=? AND user_id=?").bind(app.resume_version_id,userId).first<{truth_status:string}>();
  if(resume?.truth_status!=="passed") throw new Error("Resume truth check has not passed");
  const ts=now();
  const changed=await env.DB.prepare("UPDATE applications SET status='queued',submit_mode='review',queued_at=?,updated_at=? WHERE id=? AND user_id=? AND status=?")
    .bind(ts,ts,applicationId,userId,app.status).run();
  if(!changed.meta.changes) throw new Error("Application state changed concurrently");
  await env.DB.prepare("INSERT INTO application_events(id,application_id,from_status,to_status,actor,detail_json,created_at) VALUES(?,?,?,?,?,?,?)")
    .bind(crypto.randomUUID(),applicationId,app.status,"queued","agent_api",JSON.stringify({confirmed:true}),ts).run();
  await env.APPLICATION_QUEUE.send({applicationId,userId,jobId:String(app.job_id),attempt:0});
  return {queued:true,applicationId};
}
