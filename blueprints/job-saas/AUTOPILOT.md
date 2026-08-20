# Autopilot Rules

A job may be automatically queued for submission only when all of the following are true:

- match score >= user's minimum;
- daily application cap not reached;
- job is not excluded by company/title/location/industry rules;
- compensation does not conflict with a known minimum;
- work authorization does not conflict with the user's status;
- tailored resume truth check passes;
- no required application question is unresolved;
- target application provider is supported;
- application has not already been submitted;
- user has explicitly enabled auto-submit.

Unknown information must pause the application rather than be invented.

## Proof rule

The browser provider should capture a final success screenshot and upload it before returning success. A missing proof image is surfaced to the user, but it does **not** trigger an automatic resubmission because the employer may already have received the application.

## State machine

`discovered -> scored -> selected -> tailoring -> package_ready -> needs_input | ready_for_review | queued -> submitting -> submitted | failed -> interview | offer | rejected | withdrawn`

Transitions are server-enforced and audit logged.
