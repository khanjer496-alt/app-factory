-- Trend Scout + Content Brain execution history and experiment schema.

CREATE TABLE IF NOT EXISTS trend_scout_runs (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  provider_summary_json TEXT NOT NULL DEFAULT '[]',
  raw_count INTEGER NOT NULL DEFAULT 0,
  deduped_count INTEGER NOT NULL DEFAULT 0,
  selected_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running',
  error TEXT,
  FOREIGN KEY (product_id) REFERENCES growth_products(id)
);
CREATE INDEX IF NOT EXISTS idx_trend_scout_runs_product ON trend_scout_runs(product_id, started_at DESC);

CREATE TABLE IF NOT EXISTS trend_signal_scores (
  run_id TEXT NOT NULL,
  trend_signal_id TEXT NOT NULL,
  trend_score REAL NOT NULL,
  product_relevance REAL NOT NULL,
  freshness REAL NOT NULL,
  reasons_json TEXT NOT NULL DEFAULT '[]',
  PRIMARY KEY (run_id, trend_signal_id),
  FOREIGN KEY (run_id) REFERENCES trend_scout_runs(id),
  FOREIGN KEY (trend_signal_id) REFERENCES trend_signals(id)
);

CREATE TABLE IF NOT EXISTS content_brain_runs (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  model TEXT,
  fallback_used INTEGER NOT NULL DEFAULT 0,
  trend_ids_json TEXT NOT NULL DEFAULT '[]',
  idea_count INTEGER NOT NULL DEFAULT 0,
  experiment_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  error TEXT,
  FOREIGN KEY (product_id) REFERENCES growth_products(id)
);
CREATE INDEX IF NOT EXISTS idx_content_brain_runs_product ON content_brain_runs(product_id, generated_at DESC);

CREATE TABLE IF NOT EXISTS content_experiments (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  source_idea_id TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  primary_metric TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  winner_idea_id TEXT,
  FOREIGN KEY (product_id) REFERENCES growth_products(id),
  FOREIGN KEY (source_idea_id) REFERENCES content_ideas(id)
);

CREATE TABLE IF NOT EXISTS content_experiment_variants (
  experiment_id TEXT NOT NULL,
  idea_id TEXT NOT NULL,
  variant_label TEXT,
  PRIMARY KEY (experiment_id, idea_id),
  FOREIGN KEY (experiment_id) REFERENCES content_experiments(id),
  FOREIGN KEY (idea_id) REFERENCES content_ideas(id)
);

CREATE TABLE IF NOT EXISTS growth_learnings (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  learning_key TEXT NOT NULL,
  learning_value TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, learning_key),
  FOREIGN KEY (product_id) REFERENCES growth_products(id)
);
