# Autonomous Daily Growth Workflow

The Growth Engine now includes a scheduled Cloudflare Workflow that closes the daily loop:

1. Load registered products and existing performance learnings.
2. Scan fresh trend sources.
3. Generate and rank content ideas.
4. Run claim/risk/UGC QA.
5. Enforce daily publish and spend caps.
6. Start renders through the provider layer.
7. Durably poll asynchronous renders using Workflow sleeps.
8. Route review-required content into `content_approvals`.
9. Auto-publish eligible content to connected platforms when the product is in assisted/autopilot mode.
10. Read conversion/revenue metrics already ingested into D1.
11. Derive updated learnings for the next Content Brain cycle.
12. Persist the complete run and audit trail.

## Scheduling

Use `wrangler.daily.example.jsonc` as the starting point. Current Cloudflare Workflows support cron schedules directly on a Workflow binding. The sample is scheduled at 04:00 UTC daily; change this to the desired operating window.

## Human approvals

The daily workflow does **not** block for every human review. It writes approval items to `content_approvals`. This keeps one slow approval from blocking the rest of the products. A UI/API can approve an item and trigger a small publish-only Workflow later.

Review is automatically required when:

- the product is in `review` mode;
- QA blocks or warns on the idea;
- an AI/UGC format requires review;
- a renderer or publisher is not configured;
- the spend cap is reached;
- no compatible social account is connected;
- a platform adapter returns `needs_review`.

## Autonomy modes

- `review`: everything reaches the approval queue.
- `assisted`: clean/high-confidence items can auto-publish; uncertain items go to review.
- `autopilot`: uses the same hard QA, budget, account and platform guardrails; eligible items auto-publish.

## MoneyPrinterTurbo

`faceless_video` can use MoneyPrinterTurbo. The renderer starts `/api/v1/videos`, stores the provider job ID, and the Workflow polls task status using durable sleeps. Put MoneyPrinterTurbo behind Cloudflare Access or another private authenticated gateway; do not expose its starter API publicly.

## Credentials

`src/cloudflare/runtime.ts` includes a starter `SOCIAL_CREDENTIALS_JSON` resolver only to make the integration boundary executable. For production, replace it with an encrypted secrets/credential service. D1 should keep only `credential_ref`, never raw refresh/access tokens.

## Metrics

The workflow learns from `content_metrics`. Your product apps or analytics ingestion worker should attribute visits, signups, paid conversions and revenue back to `publication_id` / attribution codes. Platform-specific view/engagement collectors can be added independently without changing the Content Brain.

## New tables

Migration `003_daily_growth_workflow.sql` adds:

- `daily_growth_runs`
- `content_qa_results`
- `content_approvals`
- `growth_budget_ledger`

## Production checklist

Before enabling `assisted` or `autopilot`:

- run all three D1 migrations;
- connect social accounts through official OAuth flows;
- replace the starter credential resolver;
- configure at least one real renderer;
- configure current publishing flows for each platform you enable;
- verify platform app audits/permissions;
- enable product-level claims/prohibited claims;
- set daily spend and publish caps;
- confirm conversion attribution is writing into `content_metrics`;
- run several days in `review` mode first.
