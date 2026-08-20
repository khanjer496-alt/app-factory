# Job Agent SDK templates

These are intentionally tiny wrappers around the public `/v1` API so external-agent developers can integrate without adopting the product's internal codebase.

- `typescript/` uses the platform `fetch` API and adds no runtime dependency.
- `python/` uses the Python standard library and adds no runtime dependency.

Before publishing these as real packages, rename/package them for the final product brand/domain, add versioning and automated contract tests against production/staging.
