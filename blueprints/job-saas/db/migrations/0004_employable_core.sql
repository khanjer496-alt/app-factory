PRAGMA foreign_keys = ON;

-- Employable-style trust layer: every browser submission can attach private proof.
ALTER TABLE applications ADD COLUMN proof_status TEXT NOT NULL DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS application_submission_proofs (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  bytes INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'browser',
  captured_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS application_submission_proofs_app_idx
  ON application_submission_proofs(application_id,captured_at DESC);

CREATE TABLE IF NOT EXISTS job_outcomes (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL CHECK(outcome IN ('viewed','interview','offer','rejected','withdrawn')),
  source TEXT NOT NULL DEFAULT 'user',
  detail_json TEXT NOT NULL DEFAULT '{}',
  occurred_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS job_outcomes_user_idx ON job_outcomes(user_id,occurred_at DESC);
