import { Hono } from "hono";
import type { Env } from "../env";
import { requireAuth } from "../middleware";
import { AGENT_SCOPES, authenticateAgentRequest, createAgentApiKey, enforceAgentRateLimit, hasScopes, recordAgentUsage, type AgentPrincipal, type AgentScope } from "./auth";
import { getAgentApplication, listAgentApplications, listAgentJobs, prepareAgentApplication, queueAgentApplication, scoreAgentJob } from "./actions";

export const developerRoutes = new Hono<{Bindings:Env;Variables:{session:any}}>();
developerRoutes.use("/*", requireAuth as any);
const uid=(c:any)=>String(c.get("session").user.id);

developerRoutes.get("/keys",async c=>{const r=await c.env.DB.prepare("SELECT id,name,key_prefix,scopes_json,created_at,last_used_at,revoked_at FROM agent_api_keys WHERE user_id=? ORDER BY created_at DESC").bind(uid(c)).all<any>();return c.json(r.results.map(x=>({...x,scopes:JSON.parse(x.scopes_json||"[]")}))) });
developerRoutes.post("/keys",async c=>{const b=await c.req.json<any>();const scopes=Array.isArray(b.scopes)?b.scopes:[];if(scopes.includes("applications:submit")&&!b.allowSubmission)return c.json({error:"Set allowSubmission=true to create a key that can submit applications"},400);const result=await createAgentApiKey(c.env,uid(c),String(b.name||"Agent key"),scopes);return c.json({...result,warning:"This key is shown once. Store it securely."},201)});
developerRoutes.delete("/keys/:id",async c=>{const r=await c.env.DB.prepare("UPDATE agent_api_keys SET revoked_at=? WHERE id=? AND user_id=? AND revoked_at IS NULL").bind(Date.now(),c.req.param("id"),uid(c)).run();if(!r.meta.changes)return c.json({error:"Not found"},404);return c.json({revoked:true})});
developerRoutes.get("/scopes",c=>c.json({scopes:AGENT_SCOPES}));

export const agentApiRoutes = new Hono<{Bindings:Env;Variables:{principal:AgentPrincipal}}>();
agentApiRoutes.use("/*",async(c,next)=>{const p=await authenticateAgentRequest(c.env,c.req.raw);if(!p)return c.json({error:"Unauthorized"},401);try{await enforceAgentRateLimit(c.env,p,120,60_000)}catch(e){return c.json({error:String(e)},429)}c.set("principal",p);await next()});
function principal(c:any){return c.get("principal") as AgentPrincipal}
function requireScope(c:any,scope:AgentScope){const p=principal(c);if(!hasScopes(p,[scope]))return c.json({error:"Insufficient scope",required:scope},403);return null}

agentApiRoutes.get("/jobs",async c=>{const denied=requireScope(c,"jobs:read");if(denied)return denied;const p=principal(c);const result=await listAgentJobs(c.env,p.userId,Number(c.req.query("min_score")||0),Number(c.req.query("limit")||25));await recordAgentUsage(c.env,p,"rest","jobs.list","ok");return c.json({data:result})});
agentApiRoutes.post("/jobs/:id/score",async c=>{const denied=requireScope(c,"jobs:write");if(denied)return denied;const p=principal(c);try{const result=await scoreAgentJob(c.env,p.userId,c.req.param("id"));await recordAgentUsage(c.env,p,"rest","jobs.score","ok");return c.json({data:result})}catch(e){await recordAgentUsage(c.env,p,"rest","jobs.score","error");return c.json({error:String(e)},400)}});
agentApiRoutes.post("/jobs/:id/tailor",async c=>{const denied=requireScope(c,"applications:write");if(denied)return denied;const p=principal(c);try{const result=await prepareAgentApplication(c.env,p.userId,c.req.param("id"));await recordAgentUsage(c.env,p,"rest","applications.prepare","ok");return c.json({data:result})}catch(e){await recordAgentUsage(c.env,p,"rest","applications.prepare","error");return c.json({error:String(e)},400)}});
agentApiRoutes.get("/applications",async c=>{const denied=requireScope(c,"applications:read");if(denied)return denied;const p=principal(c);const data=await listAgentApplications(c.env,p.userId,Number(c.req.query("limit")||25));await recordAgentUsage(c.env,p,"rest","applications.list","ok");return c.json({data})});
agentApiRoutes.get("/applications/:id",async c=>{const denied=requireScope(c,"applications:read");if(denied)return denied;const p=principal(c);const result=await getAgentApplication(c.env,p.userId,c.req.param("id"));await recordAgentUsage(c.env,p,"rest","applications.get",result?"ok":"not_found");return result?c.json({data:result}):c.json({error:"Not found"},404)});
agentApiRoutes.post("/applications/:id/submit",async c=>{const denied=requireScope(c,"applications:submit");if(denied)return denied;const p=principal(c);const b=await c.req.json<any>().catch(()=>({}));try{const result=await queueAgentApplication(c.env,p.userId,c.req.param("id"),b.confirm===true);await recordAgentUsage(c.env,p,"rest","applications.submit","ok");return c.json({data:result})}catch(e){await recordAgentUsage(c.env,p,"rest","applications.submit","blocked");return c.json({error:String(e)},409)}});
