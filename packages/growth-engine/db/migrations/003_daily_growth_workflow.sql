-- Autonomous daily growth workflow state.

CREATE TABLE IF NOT EXISTS daily_growth_runs (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  scheduled_for TEXT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'running',
  trend_run_id TEXT,
  content_run_id TEXT,
  selected_count INTEGER NOT NULL DEFAULT 0,
  rendered_count INTEGER NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  publish_count INTEGER NOT NULL DEFAULT 0,
  spend_usd REAL NOT NULL DEFAULT 0,
  summary_json TEXT NOT NULL DEFAULT '{}',
  error TEXT,
  FOREIGN KEY (product_id) REFERENCES growth_products(id)
);
CREATE INDEX IF NOT EXISTS idx_daily_growth_runs_product ON daily_growth_runs(product_id, started_at DESC);

CREATE TABLE IF NOT EXISTS content_qa_results (
  idea_id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  passed INTEGER NOT NULL DEFAULT 0,
  auto_publish_eligible INTEGER NOT NULL DEFAULT 0,
  issues_json TEXT NOT NULL DEFAULT '[]',
  checked_at TEXT NOT NULL,
  FOREIGN KEY (idea_id) REFERENCES content_ideas(id),
  FOREIGN KEY (product_id) REFERENCES growth_products(id)
);

CREATE TABLE IF NOT EXISTS content_approvals (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  idea_id TEXT NOT NULL,
  render_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  requested_at TEXT NOT NULL,
  decided_at TEXT,
  decided_by TEXT,
  decision_note TEXT,
  FOREIGN KEY (product_id) REFERENCES growth_products(id),
  FOREIGN KEY (idea_id) REFERENCES content_ideas(id)
);
CREATE INDEX IF NOT EXISTS idx_content_approvals_product_status ON content_approvals(product_id, status, requested_at DESC);

CREATE TABLE IF NOT EXISTS growth_budget_ledger (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  run_id TEXT,
  idea_id TEXT,
  category TEXT NOT NULL,
  provider TEXT,
  amount_usd REAL NOT NULL,
  created_at TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (product_id) REFERENCES growth_products(id)
);
CREATE INDEX IF NOT EXISTS idx_growth_budget_product_time ON growth_budget_ledger(product_id, created_at DESC);
