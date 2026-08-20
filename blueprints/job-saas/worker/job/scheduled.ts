import type { Env } from "../env";
import { runUserCycle } from "./cycle";
export async function scheduledJobCycle(env:Env){const users=await env.DB.prepare("SELECT DISTINCT user_id FROM job_searches WHERE active=1").all<{user_id:string}>();const results=[];for(const row of users.results)results.push({userId:row.user_id,result:await runUserCycle(env,row.user_id)});return results}
