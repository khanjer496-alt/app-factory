import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith("--")).map(x=>{const [k,...v]=x.slice(2).split("=");return [k,v.join("=").replace(/^"|"$/g,"")]}));
if(!args.name){console.error('Usage: npm run new-job-saas -- --name="ApplyFlow" --description="AI job search agent" [--slug="applyflow"] [--destination="../applyflow"]');process.exit(1)}
const root=process.cwd();
const slug=args.slug||args.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const destination=path.resolve(root,args.destination||path.join("generated",slug));
const forwarded=[`--name=${args.name}`,`--slug=${slug}`,`--description=${args.description||"AI job-search and application agent"}`,`--destination=${destination}`];
const base=spawnSync(process.execPath,[path.join(root,"scripts","new-app.mjs"),...forwarded],{stdio:"inherit"});
if(base.status!==0)process.exit(base.status??1);
const blueprint=path.join(root,"blueprints","job-saas");
function cp(rel,destRel=rel){const src=path.join(blueprint,rel),dst=path.join(destination,destRel);fs.mkdirSync(path.dirname(dst),{recursive:true});if(fs.statSync(src).isDirectory())fs.cpSync(src,dst,{recursive:true,force:true});else fs.copyFileSync(src,dst)}
for(const rel of ["worker/job","worker/agent-api","worker/index.ts","worker/env.ts","src/App.tsx","src/styles.css","db/migrations/0002_job_saas.sql","db/migrations/0003_agent_api.sql","db/migrations/0004_employable_core.sql","tests/job-core.test.ts"])cp(rel);
for(const rel of ["JOB_SAAS.md","ARCHITECTURE.md","DATA_SOURCES.md","AUTOPILOT.md","COST_MODEL.md","AGENT_DISTRIBUTION.md","EMPLOYABLE_PRODUCT_REFERENCE.md","BROWSER_AUTOMATION_CONTRACT.md"])cp(rel,rel);
cp("README.md","JOB_BLUEPRINT_README.md");
cp(".dev.vars.job.example",".dev.vars.job.example");
cp("product.config.ts","product.config.ts");
cp("agent","agent");
cp("examples/agents","examples/agents");
cp("sdk","sdk");
cp("public/llms.txt","public/llms.txt");
cp("public/openapi.json","public/openapi.json");
for (const prompt of ["22_JOB_SAAS_LOOPCV_BUILD.md","23_AGENT_DISTRIBUTION_POSTIZ.md","24_JOB_SAAS_EMPLOYABLE_CORE.md"]) {
  const src=path.join(root,"PROMPTS",prompt),dst=path.join(destination,"PROMPTS",prompt);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(src,dst);
}
function mutate(rel,fn){const p=path.join(destination,rel);fs.writeFileSync(p,fn(fs.readFileSync(p,"utf8")))}
mutate("product.config.ts",s=>s.replace(/name: "[^"]*"/,`name: ${JSON.stringify(args.name)}`).replace(/slug: "[^"]*"/,`slug: ${JSON.stringify(slug)}`).replace(/description: "[^"]*"/,`description: ${JSON.stringify(args.description||"A continuous AI job-search and application agent")}`));
mutate("wrangler.jsonc",s=>{
  s=s.replace(/"APP_NAME": "[^"]*"/,`"APP_NAME": ${JSON.stringify(args.name)}`);
  s=s.replace(/"TURNSTILE_SITE_KEY": ""/,`"TURNSTILE_SITE_KEY": "",\n    "OPENAI_MODEL": "gpt-5.6-luna",\n    "MCP_ALLOWED_ORIGINS": "",
    "REQUIRE_SUBMISSION_PROOF": "true"`);
  s=s.replace(/"run_worker_first": \["\/api\/\*"\]/,`"run_worker_first": ["/api/*", "/v1/*", "/mcp"]`);
  s=s.replace(/\n  "send_email": \[([\s\S]*?)\n  \]\n}/m,(_m,inner)=>`\n  "send_email": [${inner}\n  ],\n  "queues": {\n    "producers": [{ "binding": "APPLICATION_QUEUE", "queue": "${slug}-applications" }],\n    "consumers": [{ "queue": "${slug}-applications", "max_batch_size": 2, "max_batch_timeout": 10, "max_retries": 3 }]\n  },\n  "triggers": { "crons": ["0 */4 * * *"] }\n}`);
  return s;
});
const pkgPath=path.join(destination,"package.json");const pkg=JSON.parse(fs.readFileSync(pkgPath,"utf8"));pkg.dependencies["@modelcontextprotocol/server"]="2.0.0";pkg.dependencies["zod"]="^4.0.0";pkg.scripts["queue:create"]=`wrangler queues create ${slug}-applications`;pkg.scripts["job:cycle:local"]="wrangler dev --test-scheduled";fs.writeFileSync(pkgPath,JSON.stringify(pkg,null,2)+"\n");
fs.writeFileSync(path.join(destination,"PRODUCT_SPEC.md"),`# ${args.name} Product Spec\n\nUse JOB_SAAS.md as the product contract.\n\n## Product\n${args.description||"A continuous AI job-search and application agent."}\n\n## MVP\n- Career Brain with verified facts\n- Job Agent/search rules\n- Greenhouse, Lever, Ashby and SmartRecruiters discovery\n- LinkedIn URL/email signal ingestion without server scraping\n- explainable match score\n- tailored truthful resume\n- application tracker\n- review-first queue\n- optional guarded autopilot\n- public REST API + remote MCP for external AI agents\n- scoped developer API keys, with submission authority separated from read/prepare authority\n- public agent/API/MCP docs and registry metadata template\n\n## Business model\nPaid only. Default reference plans: Pro $19/month and Autopilot $39/month. Stripe price IDs are authoritative and pricing is configurable.\n`);
fs.writeFileSync(path.join(destination,"README_GENERATED.md"),`# ${args.name}\n\nGenerated from App Factory Job SaaS Blueprint.\n\n## First run\n1. npm install\n2. npm run check\n3. npm run db:migrate:local\n4. npm run queue:create (for remote/production queue)\n5. Configure OPENAI_API_KEY and Stripe/Auth/Cloudflare secrets\n6. Add one or more job sources through /api/job/sources\n7. npm run dev\n\nRead JOB_SAAS.md, EMPLOYABLE_PRODUCT_REFERENCE.md, BROWSER_AUTOMATION_CONTRACT.md, AGENT_DISTRIBUTION.md, DATA_SOURCES.md, AUTOPILOT.md and LAUNCH_CHECKLIST.md before production.\n`);
console.log(`Created Job SaaS: ${destination}`);
console.log(`Next: cd ${destination} && npm install && npm run check && npm run db:migrate:local`);
