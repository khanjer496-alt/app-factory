import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import type { Env } from "../env";
import { authenticateAgentRequest, enforceAgentRateLimit, hasScopes, recordAgentUsage, type AgentPrincipal, type AgentScope } from "./auth";
import { getAgentApplication, listAgentApplications, listAgentJobs, prepareAgentApplication, queueAgentApplication, scoreAgentJob } from "./actions";

function asText(value: unknown){return [{type:"text" as const,text:JSON.stringify(value,null,2)}]}
function requireScope(principal:AgentPrincipal, scope:AgentScope){if(!hasScopes(principal,[scope]))throw new Error(`Insufficient scope: ${scope}`)}

function serverFactory(env:Env, principal:AgentPrincipal){
  const server=new McpServer({name:env.APP_NAME||"Job Application Agent",version:"1.0.0"});
  server.registerTool("search_jobs",{title:"Search matched jobs",description:"Return the candidate's highest-scoring jobs already discovered and scored by the job agent.",inputSchema:z.object({minScore:z.number().min(0).max(100).default(80),limit:z.number().int().min(1).max(100).default(20)}),annotations:{readOnlyHint:true}},async({minScore,limit})=>{requireScope(principal,"jobs:read");const data=await listAgentJobs(env,principal.userId,minScore,limit);await recordAgentUsage(env,principal,"mcp","search_jobs","ok");return{content:asText(data),structuredContent:{jobs:data}}});
  server.registerTool("score_job",{title:"Score a job",description:"Score a discovered job against the user's verified Career Brain and explain strengths and gaps.",inputSchema:z.object({jobId:z.string().min(1)})},async({jobId})=>{requireScope(principal,"jobs:write");const data=await scoreAgentJob(env,principal.userId,jobId);await recordAgentUsage(env,principal,"mcp","score_job","ok");return{content:asText(data),structuredContent:data}});
  server.registerTool("tailor_resume",{title:"Tailor resume",description:"Create a job-specific resume using only verified or user-provided Career Brain facts, then run a separate truth check.",inputSchema:z.object({jobId:z.string().min(1)})},async({jobId})=>{requireScope(principal,"applications:write");const data=await prepareAgentApplication(env,principal.userId,jobId);await recordAgentUsage(env,principal,"mcp","tailor_resume","ok");return{content:asText(data),structuredContent:data}});
  server.registerTool("prepare_application",{title:"Prepare application",description:"Prepare the truthful tailored application package for a job. This does not submit it.",inputSchema:z.object({jobId:z.string().min(1)})},async({jobId})=>{requireScope(principal,"applications:write");const data=await prepareAgentApplication(env,principal.userId,jobId);await recordAgentUsage(env,principal,"mcp","prepare_application","ok");return{content:asText(data),structuredContent:data}});
  server.registerTool("list_applications",{title:"List applications",description:"Return recent prepared, submitted, interview, offer, and rejected applications.",inputSchema:z.object({limit:z.number().int().min(1).max(100).default(25)}),annotations:{readOnlyHint:true}},async({limit})=>{requireScope(principal,"applications:read");const data=await listAgentApplications(env,principal.userId,limit);await recordAgentUsage(env,principal,"mcp","list_applications","ok");return{content:asText(data),structuredContent:{applications:data}}});
  server.registerTool("get_application_status",{title:"Get application status",description:"Return one application, its match, tailored resume truth status, unresolved questions, and submission state.",inputSchema:z.object({applicationId:z.string().min(1)}),annotations:{readOnlyHint:true}},async({applicationId})=>{requireScope(principal,"applications:read");const data=await getAgentApplication(env,principal.userId,applicationId);if(!data)throw new Error("Application not found");await recordAgentUsage(env,principal,"mcp","get_application_status","ok");return{content:asText(data),structuredContent:data}});
  server.registerTool("submit_application",{title:"Submit application",description:"Queue a fully prepared application for submission. Requires applications:submit scope, a passed truth check, no unresolved questions, and confirm=true.",inputSchema:z.object({applicationId:z.string().min(1),confirm:z.literal(true)}),annotations:{readOnlyHint:false}},async({applicationId,confirm})=>{requireScope(principal,"applications:submit");const data=await queueAgentApplication(env,principal.userId,applicationId,confirm);await recordAgentUsage(env,principal,"mcp","submit_application","ok");return{content:asText(data),structuredContent:data}});
  return server;
}

export async function handleMcpRequest(env:Env,request:Request):Promise<Response>{
  if(request.method!=="POST")return new Response("MCP endpoint accepts POST",{status:405,headers:{allow:"POST"}});
  const origin=request.headers.get("origin");
  if(origin){const allowed=(env.MCP_ALLOWED_ORIGINS||env.APP_URL).split(",").map(x=>x.trim()).filter(Boolean);if(!allowed.includes(origin))return new Response("Forbidden origin",{status:403})}
  const principal=await authenticateAgentRequest(env,request);
  if(!principal)return new Response(JSON.stringify({jsonrpc:"2.0",error:{code:-32001,message:"Unauthorized"},id:null}),{status:401,headers:{"content-type":"application/json","www-authenticate":'Bearer realm="mcp"'}});
  try{await enforceAgentRateLimit(env,principal,120,60_000)}catch(e){return new Response(JSON.stringify({jsonrpc:"2.0",error:{code:-32029,message:String(e)},id:null}),{status:429,headers:{"content-type":"application/json"}})}
  const handler=createMcpHandler(({authInfo})=>serverFactory(env,{...principal,scopes:(authInfo?.scopes||principal.scopes) as any}),{legacy:"stateless"});
  return handler.fetch(request,{authInfo:{token:"api-key",clientId:principal.keyId,scopes:principal.scopes,resource:new URL(`${env.APP_URL.replace(/\/$/,"")}/mcp`),extra:{userId:principal.userId,keyId:principal.keyId}}});
}
