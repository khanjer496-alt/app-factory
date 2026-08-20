import type { Env } from "../env";
import { now } from "./util";

export function isLinkedInJobUrl(url:string):boolean { try{const u=new URL(url);return /(^|\.)linkedin\.com$/i.test(u.hostname) && /\/jobs\//.test(u.pathname)}catch{return false} }

export async function ingestLinkedInUrl(env:Env,userId:string,url:string){
  if(!isLinkedInJobUrl(url)) throw new Error("Not a LinkedIn job URL");
  const id=crypto.randomUUID(),ts=now();
  await env.DB.prepare("INSERT INTO job_ingestion_leads(id,user_id,channel,source_url,resolution_status,created_at,updated_at) VALUES(?,?, 'linkedin_url',?,'pending',?,?)").bind(id,userId,url,ts,ts).run();
  return {id,status:"pending_resolution"};
}

export async function ingestLinkedInAlertText(env:Env,userId:string,text:string){
  const urls=[...text.matchAll(/https?:\/\/[^\s<>\"]+/g)].map(m=>m[0].replace(/[),.;]+$/,"" )).filter(isLinkedInJobUrl).slice(0,50);
  const ts=now(); const ids:string[]=[];
  for(const url of [...new Set(urls)]){const id=crypto.randomUUID();ids.push(id);await env.DB.prepare("INSERT INTO job_ingestion_leads(id,user_id,channel,source_url,payload_text,resolution_status,created_at,updated_at) VALUES(?,?, 'linkedin_email',?,?,'pending',?,?)").bind(id,userId,url,text.slice(0,12000),ts,ts).run()}
  return {created:ids.length,ids};
}
