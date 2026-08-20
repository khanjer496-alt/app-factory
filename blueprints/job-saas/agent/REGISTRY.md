# MCP Registry Launch Checklist

1. Deploy the public `https://YOUR_DOMAIN/mcp` endpoint.
2. Create a limited test API key without `applications:submit`.
3. Verify `tools/list`, `search_jobs`, and `get_application_status` from an MCP client.
4. Replace `YOUR_DOMAIN` in `server.json.template`; the launch template declares a secret `Authorization` header for the scoped API key.
5. Validate the metadata against the Official MCP Registry schema/API.
6. Verify the namespace/domain ownership required by the registry.
7. Publish only after the endpoint and docs are stable.
8. Keep submission tools approval-gated in client examples.

The Official MCP Registry is discovery metadata, not your billing system. API/MCP usage is still authorized and metered by this product.
