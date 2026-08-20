import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import type { Env } from "./env";
import { createAuth } from "./auth";
import { billing } from "./routes/billing";
import { files } from "./routes/files";
import { account } from "./routes/account";
import { admin } from "./routes/admin";
import { jobRoutes } from "./job/routes";
import { processApplicationMessage } from "./job/queue";
import { scheduledJobCycle } from "./job/scheduled";
import { internalJobRoutes } from "./job/internal";
import type { ApplicationQueueMessage } from "./job/types";
import { developerRoutes, agentApiRoutes } from "./agent-api/routes";
import { handleMcpRequest } from "./agent-api/mcp";

const app = new Hono<{ Bindings: Env }>();
app.use("/api/*", secureHeaders());
app.use("/api/*", async (c,next)=>{c.header("cache-control","no-store"); await next();});
app.use("/api/*", cors({ origin: (origin,c)=> origin === c.env.APP_URL ? origin : c.env.APP_URL, credentials:true }));
app.use("/v1/*", secureHeaders());
app.use("/v1/*", async (c,next)=>{c.header("cache-control","no-store"); await next();});
app.use("/mcp", secureHeaders());
app.get("/api/flags", async (c) => { const result = await c.env.DB.prepare("SELECT key FROM feature_flags WHERE enabled=1 ORDER BY key").all<{key:string}>(); return c.json({ flags: result.results.map((row) => row.key) }); });
app.get("/api/health", async (c) => { const db = await c.env.DB.prepare("SELECT 1 AS ok").first<{ok:number}>(); return c.json({ status: db?.ok === 1 ? "ok" : "degraded", environment: c.env.APP_ENV, time: new Date().toISOString() }); });
app.on(["GET","POST"], "/api/auth/*", (c) => createAuth(c.env,c.executionCtx).handler(c.req.raw));
app.route("/api/billing", billing);
app.route("/api/files", files);
app.route("/api/account", account);
app.route("/api/admin", admin);
app.route("/api/job", jobRoutes);
app.route("/api/internal/job", internalJobRoutes);
app.route("/api/developer", developerRoutes);
app.route("/v1", agentApiRoutes);
app.all("/mcp", (c) => handleMcpRequest(c.env, c.req.raw));
app.notFound((c)=>c.json({error:"API route not found"},404));
app.onError((err,c)=>{console.error(err);return c.json({error:"Internal server error"},500)});

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<ApplicationQueueMessage>, env: Env) {
    for (const message of batch.messages) {
      try { await processApplicationMessage(env, message.body); message.ack(); }
      catch (error) { console.error("application queue failure", error); message.retry(); }
    }
  },
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(scheduledJobCycle(env).then(r=>console.log("job cycle",JSON.stringify(r))).catch(e=>console.error("job cycle failed",e)));
  }
};
