-- Growth Engine core schema for Cloudflare D1 / SQLite.

CREATE TABLE IF NOT EXISTS growth_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  product_brain_json TEXT NOT NULL,
  autonomy_mode TEXT NOT NULL DEFAULT 'review',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_connections (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  account_external_id TEXT,
  account_handle TEXT,
  credential_ref TEXT NOT NULL,
  scopes_json TEXT NOT NULL DEFAULT '[]',
  expires_at TEXT,
  status TEXT NOT NULL DEFAULT 'connected',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES growth_products(id)
);
CREATE INDEX IF NOT EXISTS idx_social_connections_product ON social_connections(product_id, platform);

CREATE TABLE IF NOT EXISTS trend_signals (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  source TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  region TEXT,
  language TEXT,
  format TEXT,
  text TEXT NOT NULL,
  url TEXT,
  keywords_json TEXT NOT NULL DEFAULT '[]',
  velocity REAL,
  confidence REAL NOT NULL DEFAULT 0,
  expires_at TEXT,
  raw_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_trends_product_time ON trend_signals(product_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS content_ideas (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  source_trend_ids_json TEXT NOT NULL DEFAULT '[]',
  hook TEXT NOT NULL,
  angle TEXT NOT NULL,
  format TEXT NOT NULL,
  language TEXT NOT NULL,
  script TEXT,
  visual_plan_json TEXT NOT NULL DEFAULT '[]',
  cta TEXT,
  score REAL NOT NULL DEFAULT 0,
  confidence REAL NOT NULL DEFAULT 0,
  risk TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES growth_products(id)
);
CREATE INDEX IF NOT EXISTS idx_ideas_product_score ON content_ideas(product_id, score DESC);

CREATE TABLE IF NOT EXISTS content_renders (
  id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_job_id TEXT,
  status TEXT NOT NULL,
  media_r2_key TEXT,
  cost_usd REAL NOT NULL DEFAULT 0,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idea_id) REFERENCES content_ideas(id)
);

CREATE TABLE IF NOT EXISTS content_publications (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  idea_id TEXT NOT NULL,
  render_id TEXT,
  platform TEXT NOT NULL,
  connection_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  scheduled_at TEXT,
  published_at TEXT,
  external_post_id TEXT,
  external_url TEXT,
  attribution_code TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_publications_product_status ON content_publications(product_id, status, scheduled_at);

CREATE TABLE IF NOT EXISTS content_metrics (
  id TEXT PRIMARY KEY,
  publication_id TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  views INTEGER,
  impressions INTEGER,
  engagements INTEGER,
  clicks INTEGER,
  signups INTEGER,
  paid_conversions INTEGER,
  revenue_usd REAL,
  raw_json TEXT,
  FOREIGN KEY (publication_id) REFERENCES content_publications(id)
);
CREATE INDEX IF NOT EXISTS idx_metrics_publication_time ON content_metrics(publication_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS growth_audit_log (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  result TEXT NOT NULL,
  details_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
