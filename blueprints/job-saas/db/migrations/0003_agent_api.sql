PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS agent_api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  scopes_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  last_used_at INTEGER,
  revoked_at INTEGER
);
CREATE INDEX IF NOT EXISTS agent_api_keys_user_idx ON agent_api_keys(user_id, revoked_at);

CREATE TABLE IF NOT EXISTS agent_api_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  api_key_id TEXT REFERENCES agent_api_keys(id) ON DELETE SET NULL,
  interface TEXT NOT NULL CHECK(interface IN ('rest','mcp')),
  operation TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS agent_api_usage_user_idx ON agent_api_usage(user_id, created_at DESC);
