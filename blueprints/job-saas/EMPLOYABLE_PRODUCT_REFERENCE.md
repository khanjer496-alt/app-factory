# Employable-style Product Core

The consumer experience should be simpler than the underlying architecture.

## First-time user

1. Create account.
2. Upload one existing CV.
3. Review the extracted Career Brain.
4. Choose roles, locations, match threshold, and daily application cap.
5. Start the Job Agent.

The user should not need to understand ATS adapters, queues, MCP, model routing, or browser workers.

## Trust contract

Every submitted application should expose:

- matched job and score;
- exact tailored resume version used;
- truth-check result;
- application questions/answers;
- submission timestamp;
- ATS/form provider when known;
- private proof-of-submission screenshot when captured;
- explicit `proof missing` state when no screenshot is available.

## Differentiation

Keep the Employable-style browser automation and proof model, but make these product-defining:

- a unique tailored resume for each strong job;
- claim provenance against Career Brain facts;
- explainable match scoring;
- controlled review/autopilot modes;
- REST + MCP infrastructure for outside AI agents;
- outcome learning based on interviews/offers, not submission volume.
