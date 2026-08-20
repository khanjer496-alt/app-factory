# Prompt — Add In-App Page Agent

Add Alibaba Page Agent only if natural-language control materially improves this product.

Before implementation:
1. read `integrations/page-agent/README.md`, `SECURITY.md`, `AGENTS.md`, and `VISION.md` if present;
2. identify the exact user workflows Page Agent will simplify;
3. ensure the existing API remains the authorization/source-of-truth layer;
4. never expose permanent model/provider secrets in client-side JavaScript;
5. route model calls through the product's authenticated Worker/model gateway;
6. preserve confirmation for destructive, financial, publishing, submission or account-changing actions;
7. log high-impact actions initiated by the agent;
8. add a product feature flag so the capability can be disabled;
9. add tests for unauthorized actions and prompt-injection-like DOM content;
10. do not introduce Page Agent if a simpler normal UI is better.

Implement the smallest useful natural-language workflow first.
