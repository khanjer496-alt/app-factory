# Job SaaS Cost Model

Track cost at the application level.

Fields to record:

- model;
- input/output tokens when returned by provider;
- estimated model cost;
- discovery-provider cost;
- browser seconds/minutes;
- retry count;
- total estimated cost per application;
- paid conversion and plan revenue.

Cost controls:

1. deterministic filtering before AI;
2. cache/reuse static Career Brain context where the provider supports it;
3. score before tailoring;
4. tailor only jobs above threshold;
5. browser automation only after package readiness;
6. strict retry and daily application caps;
7. stronger models only on low-confidence cases.
