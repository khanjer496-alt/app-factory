# Prompt — Debug and Repair the App

Problem:

[PASTE ERROR / SYMPTOM HERE]

Treat this as an engineering repair task, not a speculative explanation.

1. reproduce the failure if possible;
2. inspect relevant logs/code/config;
3. identify the root cause;
4. fix the root cause rather than suppressing the symptom;
5. add a regression test where practical;
6. run typecheck/tests/build/security checks affected by the change;
7. verify that the fix does not violate `VISION.md`, architecture, security, or cost rules;
8. update docs only if behavior/configuration changed.

Do not make broad framework/infrastructure changes unless the root cause genuinely requires them.

At the end report:

- root cause;
- files changed;
- validation run;
- any remaining risk.
