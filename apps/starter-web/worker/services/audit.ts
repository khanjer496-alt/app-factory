import type { Env } from "../env";
export async function audit(env:Env,input:{actor?:string;action:string;resourceType?:string;resourceId?:string;result?:string}){
  await env.DB.prepare("INSERT INTO audit_log(id,actor_user_id,action,resource_type,resource_id,result,created_at) VALUES(?,?,?,?,?,?,?)").bind(crypto.randomUUID(),input.actor||null,input.action,input.resourceType||null,input.resourceId||null,input.result||"success",Date.now()).run();
}
