import type { Env } from "../env";
import { sourceAdapter } from "./sources";
import { upsertJob } from "./store";

export async function runDiscovery(env:Env,userId?:string){
  const q=userId?"SELECT provider,identifier FROM job_source_configs WHERE enabled=1 AND (user_id=? OR user_id IS NULL)":"SELECT provider,identifier FROM job_source_configs WHERE enabled=1";
  const r=userId?await env.DB.prepare(q).bind(userId).all<{provider:string;identifier:string}>():await env.DB.prepare(q).all<{provider:string;identifier:string}>();
  let fetched=0,stored=0; const errors:Array<{provider:string;identifier:string;error:string}>=[];
  for(const cfg of r.results){const adapter=sourceAdapter(cfg.provider,env);if(!adapter)continue;try{const jobs=await adapter.fetchJobs(cfg.identifier);fetched+=jobs.length;for(const job of jobs){await upsertJob(env,job);stored++}}catch(e){errors.push({provider:cfg.provider,identifier:cfg.identifier,error:String(e)})}}
  return {sources:r.results.length,fetched,stored,errors};
}
