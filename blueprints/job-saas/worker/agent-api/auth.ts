import type { Env } from "../env";

export const AGENT_SCOPES = ["jobs:read", "jobs:write", "applications:read", "applications:write", "applications:submit"] as const;
export type AgentScope = typeof AGENT_SCOPES[number];

export interface AgentPrincipal {
  keyId: string;
  userId: string;
  scopes: AgentScope[];
  prefix: string;
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return [...digest].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizeScopes(input: unknown): AgentScope[] {
  const values = Array.isArray(input) ? input : [];
  return [...new Set(values.filter((x): x is AgentScope => typeof x === "string" && (AGENT_SCOPES as readonly string[]).includes(x)))];
}

export async function createAgentApiKey(env: Env, userId: string, name: string, requestedScopes: unknown) {
  const scopes = normalizeScopes(requestedScopes);
  if (!scopes.length) scopes.push("jobs:read", "applications:read");
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const key = `${env.APP_ENV === "production" ? "af_live" : "af_test"}_${base64Url(bytes)}`;
  const id = crypto.randomUUID();
  const prefix = key.slice(0, 18);
  const hash = await sha256Hex(key);
  await env.DB.prepare("INSERT INTO agent_api_keys(id,user_id,name,key_prefix,key_hash,scopes_json,created_at) VALUES(?,?,?,?,?,?,?)")
    .bind(id, userId, name.slice(0, 80) || "Agent key", prefix, hash, JSON.stringify(scopes), Date.now()).run();
  return { id, key, prefix, scopes };
}

export async function authenticateAgentRequest(env: Env, request: Request): Promise<AgentPrincipal | null> {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!/^af_(live|test)_[A-Za-z0-9_-]{20,}$/.test(token)) return null;
  const hash = await sha256Hex(token);
  const row = await env.DB.prepare("SELECT id,user_id,key_prefix,scopes_json FROM agent_api_keys WHERE key_hash=? AND revoked_at IS NULL")
    .bind(hash).first<{id:string;user_id:string;key_prefix:string;scopes_json:string}>();
  if (!row) return null;
  await env.DB.prepare("UPDATE agent_api_keys SET last_used_at=? WHERE id=?").bind(Date.now(), row.id).run();
  let raw: unknown = [];
  try { raw = JSON.parse(row.scopes_json || "[]"); } catch {}
  return { keyId: row.id, userId: row.user_id, prefix: row.key_prefix, scopes: normalizeScopes(raw) };
}

export function hasScopes(principal: AgentPrincipal, required: AgentScope[]): boolean {
  return required.every((scope) => principal.scopes.includes(scope));
}

export async function enforceAgentRateLimit(env: Env, principal: AgentPrincipal, maxRequests = 120, windowMs = 60_000): Promise<void> {
  const since = Date.now() - windowMs;
  const row = await env.DB.prepare("SELECT COUNT(*) count FROM agent_api_usage WHERE api_key_id=? AND created_at>=?")
    .bind(principal.keyId, since).first<{count:number}>();
  if (Number(row?.count || 0) >= maxRequests) throw new Error("Agent API rate limit exceeded");
}

export async function recordAgentUsage(env: Env, principal: AgentPrincipal, interfaceName: "rest"|"mcp", operation: string, result: string) {
  await env.DB.prepare("INSERT INTO agent_api_usage(id,user_id,api_key_id,interface,operation,result,created_at) VALUES(?,?,?,?,?,?,?)")
    .bind(crypto.randomUUID(), principal.userId, principal.keyId, interfaceName, operation.slice(0,80), result.slice(0,40), Date.now()).run();
}
