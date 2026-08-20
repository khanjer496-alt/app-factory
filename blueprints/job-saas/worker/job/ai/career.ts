import type { Env } from "../../env";
import { structuredCall } from "./openai";

const schema={type:"object",additionalProperties:false,properties:{headline:{type:"string"},summary:{type:"string"},facts:{type:"array",items:{type:"object",additionalProperties:false,properties:{type:{type:"string",enum:["experience","achievement","skill","education","certification","language","work_authorization","other"]},employer:{type:["string","null"]},role:{type:["string","null"]},text:{type:"string"}},required:["type","employer","role","text"]}}},required:["headline","summary","facts"]};

export async function extractCareerFile(env:Env,args:{filename:string;contentType:string;base64:string}){
  return structuredCall<any>(env,{name:"career_profile",schema,instructions:"Extract a complete career profile from this CV/resume. Preserve dates, titles, employers, metrics and achievements exactly when present. Do not infer missing achievements, salaries, certifications or work authorization. Split facts into useful atomic entries. Extracted facts are candidates for user confirmation, not automatically verified.",input:[{role:"user",content:[{type:"input_file",file_data:args.base64,filename:args.filename},{type:"input_text",text:"Extract the candidate career facts from this CV. Missing information must remain missing."}]}]});
}
