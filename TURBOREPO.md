# Turborepo in App Factory

App Factory itself is a monorepo. Generated products are standalone repositories.

## Why

- One task graph for the starter runtime and shared factory packages.
- Local/remote caching can avoid rebuilding unchanged work.
- `turbo --affected` can focus CI on work impacted by a Git change.
- Shared packages stay bounded while launched products remain simple.

## Workspace layout

```text
apps/
  starter-web/          runnable standalone Cloudflare SaaS template
packages/
  growth-engine/        shared autonomous growth system
integrations/           optional provider/reference adapters
design/                 design-engine guidance
skills/                  agent skills
scripts/                 factory tooling
PROMPTS/                 coding-agent prompts
```

## Common commands

```bash
npm install
npm run dev
npm run check
npm run test
npm run build
npm run affected
npm run graph
```

`npm run new-app -- --name="Example" --destination="../example"` exports `apps/starter-web` into an independent app repository. Turborepo is not required inside that generated app.

## Caching

Local caching is automatic. Remote caching is optional. Do not make Vercel or any hosted cache a launch dependency. Turborepo supports compatible remote-cache servers, but use one only when CI time justifies it.

## Rules

- Do not put unrelated launched businesses under `apps/`.
- `apps/starter-web` is a template, not a production business.
- Reusable factory-wide runtime logic may graduate into `packages/` after at least two real consumers exist.
- Avoid extracting packages speculatively.
- A generated product should stay independently deployable with normal `npm` + Cloudflare tooling.
