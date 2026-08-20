import { Hono } from "hono";
import type { Env } from "../env";
import { safeJson, now } from "./util";

export const internalJobRoutes=new Hono<{Bindings:Env}>();
internalJobRoutes.use("/*",async(c,next)=>{const expected=c.env.APPLICATION_AUTOMATION_TOKEN;if(!expected)return c.json({error:"Automation token not configured"},503);if(c.req.header("authorization")!==`Bearer ${expected}`)return c.json({error:"Unauthorized"},401);await next()});

internalJobRoutes.get("/applications/:id/package",async c=>{
  const a=await c.env.DB.prepare(`SELECT a.id,a.status,a.user_id,a.job_id,j.company,j.title,j.location,j.apply_url,j.source_url,j.description,u.name,u.email,rv.content_json,rv.truth_status FROM applications a JOIN jobs j ON j.id=a.job_id JOIN "user" u ON u.id=a.user_id LEFT JOIN resume_versions rv ON rv.id=a.resume_version_id WHERE a.id=?`).bind(c.req.param("id")).first<any>();
  if(!a)return c.json({error:"Not found"},404);
  const answers=await c.env.DB.prepare("SELECT id,question,answer,source,requires_user_input FROM application_answers WHERE application_id=? ORDER BY created_at").bind(a.id).all();
  return c.json({application:{id:a.id,status:a.status},candidate:{name:a.name,email:a.email},job:{id:a.job_id,company:a.company,title:a.title,location:a.location,applyUrl:a.apply_url||a.source_url,description:a.description},resume:{truthStatus:a.truth_status,content:safeJson(a.content_json,{})},answers:answers.results});
});

internalJobRoutes.post("/applications/:id/proof",async c=>{
  const app=await c.env.DB.prepare("SELECT id,user_id FROM applications WHERE id=?").bind(c.req.param("id")).first<{id:string;user_id:string}>();
  if(!app)return c.json({error:"Not found"},404);
  const contentType=(c.req.header("content-type")||"").split(";")[0].trim().toLowerCase();
  if(!["image/png","image/jpeg","image/webp"].includes(contentType))return c.json({error:"Proof must be PNG, JPEG, or WebP"},415);
  const bytes=new Uint8Array(await c.req.arrayBuffer());
  if(!bytes.byteLength||bytes.byteLength>5*1024*1024)return c.json({error:"Proof must be between 1 byte and 5 MB"},413);
  const ext=contentType==="image/png"?"png":contentType==="image/webp"?"webp":"jpg";
  const id=crypto.randomUUID(),ts=now();
  const key=`job-submission-proof/${app.user_id}/${app.id}/${id}.${ext}`;
  await c.env.FILES.put(key,bytes,{httpMetadata:{contentType},customMetadata:{applicationId:app.id,userId:app.user_id}});
  await c.env.DB.prepare("INSERT INTO application_submission_proofs(id,application_id,user_id,r2_key,content_type,bytes,source,captured_at,created_at) VALUES(?,?,?,?,?,?, 'browser',?,?)").bind(id,app.id,app.user_id,key,contentType,bytes.byteLength,ts,ts).run();
  await c.env.DB.prepare("UPDATE applications SET proof_status='captured',updated_at=? WHERE id=?").bind(ts,app.id).run();
  await c.env.DB.prepare("INSERT INTO application_events(id,application_id,from_status,to_status,actor,detail_json,created_at) VALUES(?,?,?,?,?,?,?)").bind(crypto.randomUUID(),app.id,null,"proof_captured","automation",JSON.stringify({proofId:id,bytes:bytes.byteLength,contentType}),ts).run();
  return c.json({proofId:id,stored:true},201);
});
