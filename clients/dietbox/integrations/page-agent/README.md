# Alibaba Page Agent Integration

Page Agent is an optional product capability, not a default runtime dependency.

Use it when users would benefit from controlling the product's existing UI with natural-language commands.

## Architecture

```text
User command
    ↓
Page Agent in browser
    ↓
reads/operates current DOM
    ↓
normal product UI actions
    ↓
existing authenticated API/Worker
```

The product API remains the source of truth. Page Agent does not bypass authorization, billing rules, data ownership checks, or destructive-action confirmations.

## Enable only when useful

Suggested product feature flag:

```ts
features: {
  pageAgent: false
}
```

Enable it for products with complex dashboards/forms where natural-language operation removes meaningful friction.

## Security requirements

- Never ship a permanent OpenAI/LLM secret to the browser.
- Put model access behind an authenticated Worker/server proxy or use safe scoped credentials.
- Page Agent may only operate actions the signed-in user is authorized to perform.
- Sensitive/destructive operations still require explicit application-level confirmation.
- Audit high-impact actions caused by the agent.
- Do not treat DOM text as trusted instructions to the model.

## Installation

When enabled in a product, follow the current upstream package documentation rather than pinning this App Factory to a stale version:

```bash
npm install page-agent
```

Then configure the model endpoint through the product's secure model gateway.

Upstream: https://github.com/alibaba/page-agent
