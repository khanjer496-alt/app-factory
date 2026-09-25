-- Auto-renewing meal plans (Stripe Billing). Orders placed before this were one-off packages and keep auto_renew=0.
ALTER TABLE plan_orders ADD COLUMN auto_renew INTEGER NOT NULL DEFAULT 0;
-- none: one-off package · active: renewing normally · past_due: last renewal payment failed · canceled: will not renew again
ALTER TABLE plan_orders ADD COLUMN billing_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE plan_orders ADD COLUMN cycle INTEGER NOT NULL DEFAULT 1;
ALTER TABLE plan_orders ADD COLUMN next_charge_at INTEGER;
ALTER TABLE plan_orders ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE plan_orders ADD COLUMN stripe_customer_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS plan_orders_subscription_idx ON plan_orders(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS plan_orders_renewal_idx ON plan_orders(status, billing_status, next_charge_at);

-- One row per paid cycle. payment_ref is the Checkout session / invoice id (or demo:<order>:<cycle>) and makes renewals idempotent.
CREATE TABLE IF NOT EXISTS plan_cycles (
  order_id TEXT NOT NULL REFERENCES plan_orders(id) ON DELETE CASCADE,
  cycle INTEGER NOT NULL,
  payment_ref TEXT NOT NULL UNIQUE,
  amount_fils INTEGER NOT NULL,
  first_date TEXT NOT NULL,
  last_date TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY(order_id, cycle)
);

-- Reminder emails already sent, so the daily job and webhook retries never send one twice.
CREATE TABLE IF NOT EXISTS notifications_sent (
  kind TEXT NOT NULL,
  ref TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY(kind, ref)
);
CREATE INDEX IF NOT EXISTS notifications_sent_user_idx ON notifications_sent(user_id);
