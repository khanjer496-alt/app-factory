import type { Env } from "../../env";
import type { CareerFact, MatchResult, NormalizedJob } from "../types";
import { clampScore } from "../util";
import { structuredCall } from "./openai";

const schema={type:"object",additionalProperties:false,properties:{score:{type:"integer"},experience:{type:"integer"},skills:{type:"integer"},seniority:{type:"integer"},industry:{type:"integer"},location:{type:"integer"},strengths:{type:"array",items:{type:"string"}},gaps:{type:"array",items:{type:"string"}},explanation:{type:"string"}},required:["score","experience","skills","seniority","industry","location","strengths","gaps","explanation"]};

export async function scoreJob(env:Env, facts:CareerFact[], job:NormalizedJob):Promise<{result:MatchResult;model:string;inputTokens?:number;outputTokens?:number;estimatedCostUsd:number}> {
  const r=await structuredCall<any>(env,{name:"job_match",schema,instructions:"Score candidate-job fit. Use only supplied facts. Missing experience is a gap, never invent it. Scores are 0-100. Be conservative and concise.",input:JSON.stringify({candidateFacts:facts,job:{company:job.company,title:job.title,location:job.location,description:job.description,department:job.department,salaryMin:job.salaryMin,salaryMax:job.salaryMax}})});
  const result:MatchResult={score:clampScore(r.data.score),experience:clampScore(r.data.experience),skills:clampScore(r.data.skills),seniority:clampScore(r.data.seniority),industry:clampScore(r.data.industry),location:clampScore(r.data.location),strengths:(r.data.strengths||[]).slice(0,8),gaps:(r.data.gaps||[]).slice(0,8),explanation:String(r.data.explanation||"")};
  return {...r,result};
}
