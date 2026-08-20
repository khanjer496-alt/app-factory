# Browser Automation Contract

The job product treats browser execution as a replaceable provider. The Cloudflare Worker owns state, guardrails, private data, and proof storage. The browser provider owns page navigation and form interaction.

## Application endpoint

Configure `APPLICATION_AUTOMATION_ENDPOINT` and `APPLICATION_AUTOMATION_TOKEN`.

The Worker calls the provider with:

```json
{
  "applicationId": "...",
  "userId": "...",
  "jobId": "...",
  "applyUrl": "https://...",
  "packageUrl": "https://APP/api/internal/job/applications/APP_ID/package",
  "proofUploadUrl": "https://APP/api/internal/job/applications/APP_ID/proof"
}
```

The browser provider uses the same bearer token to fetch the application package and upload the final screenshot. It should upload proof **before** returning success.

Successful response:

```json
{
  "status": "submitted",
  "reference": "optional provider reference",
  "proofUploaded": true
}
```

If an unknown or sensitive required question appears, return `needs_input` and the unresolved question strings. Do not invent salary, visa, demographic, disability, security-clearance, or other user-specific facts.

## Proof upload

`POST /api/internal/job/applications/:id/proof`

- Authorization: `Bearer APPLICATION_AUTOMATION_TOKEN`
- Body: PNG, JPEG, or WebP screenshot
- Max size: 5 MB
- Stored privately in R2
- User retrieves it through the authenticated app route

A missing proof **never triggers an automatic resubmission**, because the employer may already have received the application. The application remains submitted with `proof_status=missing` so the user can see that evidence was unavailable.

## Workday discovery endpoint

Configure `JOB_DISCOVERY_AUTOMATION_ENDPOINT` and `JOB_DISCOVERY_AUTOMATION_TOKEN`.

The Worker sends:

```json
{
  "provider": "workday",
  "careerSiteUrl": "https://COMPANY.wd.../jobs",
  "limit": 100
}
```

Return `{ "jobs": [...] }` with public candidate-site job data. This keeps Workday first-class without pretending the product has employer-side Workday credentials.
