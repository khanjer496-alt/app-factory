# Prompt 21 - Turborepo Factory Workflow

Use this prompt when changing the App Factory itself.

Read `AGENTS.md`, `ARCHITECTURE.md`, `TURBOREPO.md`, `SECURITY.md`, and `COSTS.md` first.

You are working on the App Factory monorepo, not on a launched customer product.

Rules:
1. Keep `apps/starter-web` independently exportable and deployable.
2. Do not add launched businesses to this monorepo.
3. Put code in `packages/` only when it is genuinely shared across factory surfaces.
4. Use Turbo tasks instead of bespoke root orchestration when a package already exposes the task.
5. Do not make remote caching or Vercel a required dependency.
6. Run `npm run check`, `npm run test`, and `npm run build` after changes.
7. Use `npm run affected` for CI/local optimization when appropriate.
8. Preserve Cloudflare-first architecture and cost/security gates.

Before finishing, verify `npm run new-app -- --name="Smoke Test" --destination=<temp>` still exports a standalone app with no workspace references.
