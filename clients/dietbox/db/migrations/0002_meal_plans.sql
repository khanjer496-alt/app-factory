-- Dietbox meal-plan tables. Menu/programme/pricing catalogue lives in shared/catalog.ts (static, versioned with the app).
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  emirate TEXT NOT NULL,
  area TEXT NOT NULL,
  street TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS addresses_user_idx ON addresses(user_id);

CREATE TABLE IF NOT EXISTS plan_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  address_id TEXT NOT NULL REFERENCES addresses(id),
  program TEXT NOT NULL,
  meals_per_day INTEGER NOT NULL,
  days_per_week INTEGER NOT NULL,
  weeks INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  delivery_slot TEXT NOT NULL,
  kcal_target INTEGER,
  amount_fils INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'aed',
  status TEXT NOT NULL CHECK (status IN ('pending_payment','active','cancelled','completed')),
  stripe_session_id TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS plan_orders_user_idx ON plan_orders(user_id, created_at);
CREATE INDEX IF NOT EXISTS plan_orders_status_idx ON plan_orders(status);

CREATE TABLE IF NOT EXISTS delivery_days (
  order_id TEXT NOT NULL REFERENCES plan_orders(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled','skipped')),
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(order_id, date)
);
CREATE INDEX IF NOT EXISTS delivery_days_date_idx ON delivery_days(date, status);
CREATE INDEX IF NOT EXISTS delivery_days_user_idx ON delivery_days(user_id, date);

CREATE TABLE IF NOT EXISTS day_selections (
  order_id TEXT NOT NULL REFERENCES plan_orders(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('breakfast','lunch','dinner','snack1','snack2')),
  meal_id TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY(order_id, date, slot)
);
CREATE INDEX IF NOT EXISTS day_selections_date_idx ON day_selections(date);
