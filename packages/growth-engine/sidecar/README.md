# MoneyPrinterTurbo sidecar

Run MoneyPrinterTurbo as a dedicated media-rendering service, separate from Cloudflare Workers.

## Recommended network shape

```text
Growth Worker / Workflow
       |
       | HTTPS + service identity
       v
Cloudflare Access / authenticated gateway
       |
       v
VPS localhost:8080
       |
       v
MoneyPrinterTurbo FastAPI
```

The adapter uses:
- `POST /api/v1/videos` to create a render task;
- `GET /api/v1/tasks/{task_id}` to poll status.

After completion, the Growth Engine should copy the generated media into R2 and use the R2-controlled URL for downstream publishing. Do not treat the sidecar's local task storage as durable product storage.

Environment expected by the Worker adapter:

```text
MPT_BASE_URL=https://render.example.com
MPT_ACCESS_CLIENT_ID=...
MPT_ACCESS_CLIENT_SECRET=...
```

`config.toml` remains MoneyPrinterTurbo-specific and should not be committed with secrets.
