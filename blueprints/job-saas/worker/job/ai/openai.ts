import type { Env } from "../../env";

export interface StructuredCallResult<T> { data: T; model: string; inputTokens?: number; outputTokens?: number; estimatedCostUsd: number; }

function estimatedCost(model:string,input:number,output:number):number {
  if(model.includes("luna")) return input/1_000_000*0.20 + output/1_000_000*1.20;
  return 0; // configure rates before routing other paid models automatically
}

function outputText(payload:any): string {
  if (typeof payload?.output_text === "string") return payload.output_text;
  for (const item of payload?.output || []) for (const c of item?.content || []) if (typeof c?.text === "string") return c.text;
  throw new Error("OpenAI response did not contain text output");
}

export async function structuredCall<T>(env: Env, args: { name:string; schema:Record<string,unknown>; instructions:string; input:unknown; model?:string }): Promise<StructuredCallResult<T>> {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  const model=args.model || env.OPENAI_MODEL || "gpt-5.6-luna";
  const res=await fetch("https://api.openai.com/v1/responses",{
    method:"POST",
    headers:{"content-type":"application/json",authorization:`Bearer ${env.OPENAI_API_KEY}`},
    body:JSON.stringify({
      model,
      store:false,
      instructions:args.instructions,
      input:args.input,
      text:{format:{type:"json_schema",name:args.name,strict:true,schema:args.schema}}
    })
  });
  if(!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0,400)}`);
  const payload=await res.json() as any;
  const inputTokens=Number(payload.usage?.input_tokens||0), outputTokens=Number(payload.usage?.output_tokens||0);
  return {data:JSON.parse(outputText(payload)) as T,model,inputTokens,outputTokens,estimatedCostUsd:estimatedCost(model,inputTokens,outputTokens)};
}
