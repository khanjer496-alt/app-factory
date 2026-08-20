import type { Env } from "../env";

export async function autopilotDecision(env:Env,userId:string,applicationId:string):Promise<{allowed:boolean;reasons:string[]}> {
  const app=await env.DB.prepare(`SELECT a.status,a.unresolved_questions,a.resume_version_id,jm.score,js.minimum_match,js.max_applications_per_day,js.auto_submit
    FROM applications a LEFT JOIN job_matches jm ON jm.id=a.match_id LEFT JOIN job_searches js ON js.id=jm.search_id WHERE a.id=? AND a.user_id=?`).bind(applicationId,userId).first<any>();
  if(!app) return {allowed:false,reasons:["application_not_found"]};
  const reasons:string[]=[];
  if(!app.auto_submit) reasons.push("autopilot_disabled");
  if(Number(app.score||0)<Number(app.minimum_match||100)) reasons.push("below_match_threshold");
  if(Number(app.unresolved_questions||0)>0) reasons.push("unresolved_questions");
  if(!app.resume_version_id) reasons.push("resume_missing");
  else {const r=await env.DB.prepare("SELECT truth_status FROM resume_versions WHERE id=? AND user_id=?").bind(app.resume_version_id,userId).first<{truth_status:string}>();if(r?.truth_status!=="passed")reasons.push("truth_check_not_passed")}
  const dayStart=new Date();dayStart.setUTCHours(0,0,0,0);
  const count=await env.DB.prepare("SELECT COUNT(*) n FROM applications WHERE user_id=? AND submitted_at>=?").bind(userId,dayStart.getTime()).first<{n:number}>();
  if(Number(count?.n||0)>=Number(app.max_applications_per_day||0)) reasons.push("daily_cap_reached");
  if(!["package_ready","ready_for_review"].includes(app.status)) reasons.push("invalid_state");
  return {allowed:reasons.length===0,reasons};
}
