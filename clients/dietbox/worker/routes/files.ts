import { Hono } from "hono";
import type { Env } from "../env";
import { requireAuth } from "../middleware";
import { productConfig } from "../../product.config";

export const files = new Hono<{ Bindings: Env; Variables: { session: any } }>();
files.use("*", async (c, next) => {
  if (!productConfig.features.uploads) return c.json({ error: "File uploads are disabled" }, 404);
  await next();
});
files.use("*", requireAuth);

files.get("/", async (c) => {
  const user = c.get("session").user;
  const result = await c.env.DB.prepare("SELECT id,name,size,content_type,created_at FROM files WHERE user_id=? ORDER BY created_at DESC").bind(user.id).all();
  return c.json(result.results);
});

files.post("/", async (c) => {
  const user = c.get("session").user;
  const body = await c.req.parseBody();
  const file = body.file;
  if (!(file instanceof File)) return c.json({ error: "file is required" }, 400);
  const maxBytes = 25 * 1024 * 1024;
  if (file.size > maxBytes) return c.json({ error: "File exceeds 25 MB starter limit" }, 413);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,140) || "file";
  const id = crypto.randomUUID();
  const key = `${user.id}/${id}-${safeName}`;
  await c.env.FILES.put(key, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" }, customMetadata: { userId: user.id, fileId: id } });
  try {
    await c.env.DB.prepare("INSERT INTO files(id,user_id,r2_key,name,size,content_type,created_at) VALUES(?,?,?,?,?,?,?)").bind(id,user.id,key,file.name,file.size,file.type||"application/octet-stream",Date.now()).run();
  } catch (error) {
    await c.env.FILES.delete(key);
    throw error;
  }
  return c.json({ id, name: file.name, size: file.size }, 201);
});

files.get("/:id", async (c) => {
  const user = c.get("session").user;
  const row = await c.env.DB.prepare("SELECT r2_key,name,content_type FROM files WHERE id=? AND user_id=?").bind(c.req.param("id"),user.id).first<{r2_key:string;name:string;content_type:string}>();
  if(!row) return c.json({error:"Not found"},404);
  const object = await c.env.FILES.get(row.r2_key);
  if(!object) return c.json({error:"Object missing"},404);
  const headers = new Headers(); object.writeHttpMetadata(headers); headers.set("content-disposition",`attachment; filename*=UTF-8''${encodeURIComponent(row.name)}`); headers.set("cache-control","private, no-store");
  return new Response(object.body,{headers});
});

files.delete("/:id", async (c) => {
  const user = c.get("session").user;
  const row=await c.env.DB.prepare("SELECT r2_key FROM files WHERE id=? AND user_id=?").bind(c.req.param("id"),user.id).first<{r2_key:string}>();
  if(!row) return c.json({error:"Not found"},404);
  await c.env.FILES.delete(row.r2_key); await c.env.DB.prepare("DELETE FROM files WHERE id=? AND user_id=?").bind(c.req.param("id"),user.id).run();
  return c.json({deleted:true});
});
