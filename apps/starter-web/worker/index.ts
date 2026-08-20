import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import type { Env } from "./env";
import { createAuth } from "./auth";
import { billing } from "./routes/billing";
import { files } from "./routes/files";
import { account } from "./routes/account";
import { admin } from "./routes/admin";

const app = new Hono<{ Bindings: Env }>();
app.use("/api/*", secureHeaders());
app.use("/api/*", async (c,next)=>{c.header("cache-control","no-store"); await next();});
app.use("/api/*", cors({ origin: (origin,c)=> origin === c.env.APP_URL ? origin : c.env.APP_URL, credentials:true }));

app.get("/api/flags", async (c) => {
  const result = await c.env.DB.prepare("SELECT key FROM feature_flags WHERE enabled=1 ORDER BY key").all<{key:string}>();
  return c.json({ flags: result.results.map((row) => row.key) });
});

app.get("/api/health", async (c) => {
  const db = await c.env.DB.prepare("SELECT 1 AS ok").first<{ok:number}>();
  return c.json({ status: db?.ok === 1 ? "ok" : "degraded", environment: c.env.APP_ENV, time: new Date().toISOString() });
});
app.on(["GET","POST"], "/api/auth/*", (c) => createAuth(c.env,c.executionCtx).handler(c.req.raw));
app.route("/api/billing", billing);
app.route("/api/files", files);
app.route("/api/account", account);
app.route("/api/admin", admin);
app.notFound((c)=>c.json({error:"API route not found"},404));
app.onError((err,c)=>{console.error(err);return c.json({error:"Internal server error"},500)});

export default app;
