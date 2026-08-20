PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS career_profiles (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  headline TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  default_resume_file_id TEXT REFERENCES files(id) ON DELETE SET NULL,
  completeness INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS career_facts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('experience','achievement','skill','education','certification','language','work_authorization','preference','other')),
  employer TEXT,
  role TEXT,
  text TEXT NOT NULL,
  verification TEXT NOT NULL CHECK(verification IN ('verified','user_provided','inferred','unverified')),
  source TEXT,
  source_file_id TEXT REFERENCES files(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS career_facts_user_idx ON career_facts(user_id);
CREATE INDEX IF NOT EXISTS career_facts_verification_idx ON career_facts(user_id,verification);

CREATE TABLE IF NOT EXISTS job_searches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  roles_json TEXT NOT NULL,
  locations_json TEXT NOT NULL,
  industries_json TEXT NOT NULL DEFAULT '[]',
  excluded_companies_json TEXT NOT NULL DEFAULT '[]',
  excluded_keywords_json TEXT NOT NULL DEFAULT '[]',
  remote_preference TEXT,
  minimum_salary REAL,
  salary_currency TEXT,
  minimum_match INTEGER NOT NULL DEFAULT 85,
  max_applications_per_day INTEGER NOT NULL DEFAULT 5,
  auto_prepare INTEGER NOT NULL DEFAULT 1,
  auto_submit INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS job_searches_user_active_idx ON job_searches(user_id,active);

CREATE TABLE IF NOT EXISTS job_source_configs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  identifier TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL,
  UNIQUE(user_id,provider,identifier)
);
CREATE INDEX IF NOT EXISTS job_source_configs_provider_idx ON job_source_configs(provider,enabled);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  source_provider TEXT NOT NULL,
  source_key TEXT NOT NULL,
  source_url TEXT NOT NULL,
  apply_url TEXT,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  workplace_type TEXT,
  employment_type TEXT,
  salary_min REAL,
  salary_max REAL,
  salary_currency TEXT,
  description TEXT NOT NULL,
  department TEXT,
  posted_at INTEGER,
  discovered_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  raw_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE(source_provider,source_key)
);
CREATE INDEX IF NOT EXISTS jobs_company_title_idx ON jobs(company,title);
CREATE INDEX IF NOT EXISTS jobs_last_seen_idx ON jobs(last_seen_at);

CREATE TABLE IF NOT EXISTS job_matches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  search_id TEXT REFERENCES job_searches(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  experience_score INTEGER NOT NULL DEFAULT 0,
  skills_score INTEGER NOT NULL DEFAULT 0,
  seniority_score INTEGER NOT NULL DEFAULT 0,
  industry_score INTEGER NOT NULL DEFAULT 0,
  location_score INTEGER NOT NULL DEFAULT 0,
  strengths_json TEXT NOT NULL DEFAULT '[]',
  gaps_json TEXT NOT NULL DEFAULT '[]',
  explanation TEXT NOT NULL DEFAULT '',
  model TEXT,
  estimated_cost_usd REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(user_id,job_id)
);
CREATE INDEX IF NOT EXISTS job_matches_user_score_idx ON job_matches(user_id,score DESC);

CREATE TABLE IF NOT EXISTS resume_versions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL,
  source_file_id TEXT REFERENCES files(id) ON DELETE SET NULL,
  rendered_file_id TEXT REFERENCES files(id) ON DELETE SET NULL,
  content_json TEXT NOT NULL,
  change_summary_json TEXT NOT NULL DEFAULT '[]',
  truth_status TEXT NOT NULL CHECK(truth_status IN ('pending','passed','failed','needs_review')) DEFAULT 'pending',
  truth_issues_json TEXT NOT NULL DEFAULT '[]',
  model TEXT,
  estimated_cost_usd REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS resume_versions_user_job_idx ON resume_versions(user_id,job_id);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  match_id TEXT REFERENCES job_matches(id) ON DELETE SET NULL,
  resume_version_id TEXT REFERENCES resume_versions(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  submit_mode TEXT NOT NULL CHECK(submit_mode IN ('review','autopilot')) DEFAULT 'review',
  provider TEXT,
  provider_reference TEXT,
  unresolved_questions INTEGER NOT NULL DEFAULT 0,
  queued_at INTEGER,
  submitted_at INTEGER,
  updated_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user_id,job_id)
);
CREATE INDEX IF NOT EXISTS applications_user_status_idx ON applications(user_id,status);

CREATE TABLE IF NOT EXISTS application_answers (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  source TEXT NOT NULL CHECK(source IN ('career_fact','user','ai_draft','unknown')),
  requires_user_input INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS application_events (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor TEXT NOT NULL,
  detail_json TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS application_events_app_idx ON application_events(application_id,created_at);

CREATE TABLE IF NOT EXISTS job_ingestion_leads (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK(channel IN ('linkedin_url','linkedin_email','job_url','email','web','manual')),
  source_url TEXT,
  title_hint TEXT,
  company_hint TEXT,
  location_hint TEXT,
  payload_text TEXT,
  resolution_status TEXT NOT NULL DEFAULT 'pending',
  resolved_job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS job_ingestion_leads_status_idx ON job_ingestion_leads(resolution_status,created_at);

CREATE TABLE IF NOT EXISTS job_ai_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  job_id TEXT REFERENCES jobs(id) ON DELETE SET NULL,
  application_id TEXT REFERENCES applications(id) ON DELETE SET NULL,
  operation TEXT NOT NULL,
  model TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  estimated_cost_usd REAL NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS job_ai_usage_user_idx ON job_ai_usage(user_id,created_at);
