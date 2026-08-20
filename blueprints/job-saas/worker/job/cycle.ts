import type { Env } from "../env";
import { runDiscovery } from "./discovery";
import { deterministicPass, rowRules } from "./rules";
import { scoreAndPersist, prepareAndPersist, dbJobToNormalized } from "./service";
import { autopilotDecision } from "./application-guard";
import { now } from "./util";

export async function runUserCycle(env:Env,userId:string){
  const discovery=await runDiscovery(env,userId);
  const searches=await env.DB.prepare("SELECT * FROM job_searches WHERE user_id=? AND active=1 ORDER BY created_at").bind(userId).all<any>();
  let filtered=0,scored=0,prepared=0,queued=0; const errors:string[]=[];
  for(const search of searches.results){
    const rules=rowRules(search);
    const candidates=await env.DB.prepare(`SELECT j.* FROM jobs j LEFT JOIN job_matches jm ON jm.job_id=j.id AND jm.user_id=? WHERE jm.id IS NULL ORDER BY j.last_seen_at DESC LIMIT 60`).bind(userId).all<any>();
    for(const j of candidates.results){
      if(!deterministicPass(dbJobToNormalized(j),rules).pass){filtered++;continue}
      try{
        const match=await scoreAndPersist(env,userId,j.id,search.id);scored++;
        if(match.score<rules.minimumMatch)continue;
        if(rules.autoPrepare){const pkg=await prepareAndPersist(env,userId,j.id);prepared++;if(rules.autoSubmit&&pkg.applicationId){const decision=await autopilotDecision(env,userId,pkg.applicationId);if(decision.allowed){await env.DB.prepare("UPDATE applications SET status='queued',submit_mode='autopilot',queued_at=?,updated_at=? WHERE id=?").bind(now(),now(),pkg.applicationId).run();await env.APPLICATION_QUEUE.send({applicationId:pkg.applicationId,userId,jobId:j.id,attempt:0});queued++}}}
      }catch(e){errors.push(`${j.id}: ${String(e)}`)}
    }
  }
  return {discovery,searches:searches.results.length,filtered,scored,prepared,queued,errors:errors.slice(0,20)};
}
