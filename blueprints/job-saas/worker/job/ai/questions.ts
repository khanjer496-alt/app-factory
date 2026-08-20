import type { Env } from "../../env";
import type { CareerFact } from "../types";
import { structuredCall } from "./openai";

const schema={type:"object",additionalProperties:false,properties:{answer:{type:["string","null"]},supportingFactIds:{type:"array",items:{type:"string"}},needsUserInput:{type:"boolean"},reason:{type:"string"}},required:["answer","supportingFactIds","needsUserInput","reason"]};
const sensitive=/salary|compensation|visa|sponsor|work authori[sz]ation|gender|race|ethnic|disab|veteran|date of birth|birth date|age|nationality|religion|notice period/i;
export async function draftQuestionAnswer(env:Env,facts:CareerFact[],question:string){
  if(sensitive.test(question))return {data:{answer:null,supportingFactIds:[],needsUserInput:true,reason:"Sensitive or user-specific answer must come from the user."},model:"deterministic",estimatedCostUsd:0};
  return structuredCall<any>(env,{name:"application_answer",schema,instructions:"Draft a concise job-application answer using only supplied verified/user-provided career facts. If the facts do not support a truthful answer, return needsUserInput=true and answer=null. Never invent experience or personal data.",input:JSON.stringify({careerFacts:facts,question})});
}
