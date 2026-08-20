import type { Env } from "../../env";
import type { CareerFact, NormalizedJob, TailoredResume, TruthResult } from "../types";
import { structuredCall } from "./openai";

const resumeSchema={type:"object",additionalProperties:false,properties:{headline:{type:"string"},summary:{type:"string"},experience:{type:"array",items:{type:"object",additionalProperties:false,properties:{employer:{type:"string"},role:{type:"string"},bullets:{type:"array",items:{type:"string"}}},required:["employer","role","bullets"]}},skills:{type:"array",items:{type:"string"}},changeSummary:{type:"array",items:{type:"string"}}},required:["headline","summary","experience","skills","changeSummary"]};
const truthSchema={type:"object",additionalProperties:false,properties:{status:{type:"string",enum:["passed","failed","needs_review"]},issues:{type:"array",items:{type:"object",additionalProperties:false,properties:{claim:{type:"string"},reason:{type:"string"},supported:{type:"boolean"},supportingFactIds:{type:"array",items:{type:"string"}}},required:["claim","reason","supported","supportingFactIds"]}}},required:["status","issues"]};

export async function tailorResume(env:Env,facts:CareerFact[],job:NormalizedJob){
  return structuredCall<TailoredResume>(env,{name:"tailored_resume",schema:resumeSchema,instructions:"Create an ATS-friendly resume tailored to the job. You may select, reorder and rewrite supplied facts but may not invent employers, roles, dates, metrics, education, certifications or responsibilities. Preserve truthful specificity. Return only the requested structure.",input:JSON.stringify({careerFacts:facts,job})});
}
export async function verifyResume(env:Env,facts:CareerFact[],resume:TailoredResume){
  return structuredCall<TruthResult>(env,{name:"resume_truth_check",schema:truthSchema,instructions:"Audit every factual claim in this tailored resume against the supplied career facts. Mark unsupported or materially inflated claims unsupported. A passed result requires all factual claims to be supported. Wording improvements are fine; invented facts are not.",input:JSON.stringify({careerFacts:facts,resume})});
}
