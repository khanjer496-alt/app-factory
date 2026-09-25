# Disaster Recovery

The starter keeps recovery deliberately simple.

## Before risky migrations/releases

Export D1:

```bash
npm run db:backup
```

Store important backups outside the live application runtime. Do not commit backups containing customer data to Git.

## D1 restore

For a fresh replacement database, apply the schema migrations first, then import a reviewed SQL export with Wrangler. Test restore commands against a non-production database before an incident.

Do not blindly replay a backup over a live production database. Confirm the timestamp, migration version and expected data loss window first.

## R2

R2 application objects are separate from D1 metadata. For products where user files are business-critical, define an R2 retention/versioning or replication strategy appropriate to the product. The starter does not pretend every product needs the same retention policy.

## Stripe

Stripe remains the source of truth for financial/payment records. D1 stores the product entitlement mirror. If the D1 subscription mirror is damaged, reconcile it from verified Stripe subscription/customer data rather than inventing payment state.

## Recovery priority

1. stop destructive writes if corruption is ongoing;
2. preserve logs and current database export;
3. restore/replace D1 safely;
4. verify auth and subscriptions;
5. verify R2 ownership metadata;
6. resume writes;
7. document root cause and add a regression test/check.

Run a restore rehearsal before a product becomes business-critical.
