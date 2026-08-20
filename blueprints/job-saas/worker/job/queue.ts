import type { Env } from "../env";
import type { ApplicationQueueMessage } from "./types";
import { canTransition } from "./state";
import { now } from "./util";

async function move(env:Env,id:string,from:string,to:string,detail:unknown={}){if(!canTransition(from,to))throw new Error(`Invalid application transition ${from} -> ${to}`);const ts=now();const r=await env.DB.prepare("UPDATE applications SET status=?,updated_at=? WHERE id=? AND status=?").bind(to,ts,id,from).run();if(!r.meta.changes)throw new Error("Application state changed concurrently");await env.DB.prepare("INSERT INTO application_events(id,application_id,from_status,to_status,actor,detail_json,created_at) VALUES(?,?,?,?,?,?,?)").bind(crypto.randomUUID(),id,from,to,"queue",JSON.stringify(detail),ts).run()}

export async function processApplicationMessage(env:Env,msg:ApplicationQueueMessage){
  const app=await env.DB.prepare("SELECT a.*,j.apply_url,j.source_url FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.id=? AND a.user_id=?").bind(msg.applicationId,msg.userId).first<any>();
  if(!app) throw new Error("Application not found");
  if(app.status!=="queued") return;
  await move(env,app.id,"queued","submitting",{attempt:msg.attempt});
  if(!env.APPLICATION_AUTOMATION_ENDPOINT){await move(env,app.id,"submitting","needs_input",{reason:"application_automation_endpoint_not_configured",applyUrl:app.apply_url||app.source_url});return}
  const proofUploadUrl=`${env.APP_URL}/api/internal/job/applications/${app.id}/proof`;
  const res=await fetch(env.APPLICATION_AUTOMATION_ENDPOINT,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${env.APPLICATION_AUTOMATION_TOKEN||""}`},body:JSON.stringify({applicationId:app.id,userId:app.user_id,jobId:app.job_id,applyUrl:app.apply_url||app.source_url,packageUrl:`${env.APP_URL}/api/internal/job/applications/${app.id}/package`,proofUploadUrl})});
  if(res.ok){
    const data:any=await res.json().catch(()=>({}));
    if(data.status==="needs_input"&&Array.isArray(data.questions)){
      for(const question of data.questions.slice(0,30)){await env.DB.prepare("INSERT INTO application_answers(id,application_id,question,answer,source,requires_user_input,created_at,updated_at) VALUES(?,?,?,NULL,'unknown',1,?,?)").bind(crypto.randomUUID(),app.id,String(question).slice(0,2000),now(),now()).run()}
      await env.DB.prepare("UPDATE applications SET unresolved_questions=?,updated_at=? WHERE id=?").bind(data.questions.length,now(),app.id).run();
      await move(env,app.id,"submitting","needs_input",data);return;
    }
    const proof=await env.DB.prepare("SELECT id FROM application_submission_proofs WHERE application_id=? ORDER BY captured_at DESC LIMIT 1").bind(app.id).first<{id:string}>();
    const proofStatus=proof?"captured":"missing";
    await env.DB.prepare("UPDATE applications SET provider_reference=?,submitted_at=?,proof_status=? WHERE id=?").bind(data.reference||null,now(),proofStatus,app.id).run();
    await move(env,app.id,"submitting","submitted",{...data,proofStatus,proofId:proof?.id||null});
  } else {
    const text=(await res.text()).slice(0,1000);
    if(msg.attempt<2){await env.DB.prepare("UPDATE applications SET status='queued',updated_at=? WHERE id=?").bind(now(),app.id).run();await env.APPLICATION_QUEUE.send({...msg,attempt:msg.attempt+1},{delaySeconds:60*(msg.attempt+1)});return}
    await move(env,app.id,"submitting","failed",{status:res.status,error:text});
  }
}
