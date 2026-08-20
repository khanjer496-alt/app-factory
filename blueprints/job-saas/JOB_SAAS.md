# Job SaaS — Product and Operating Contract

## Product promise

The product continuously discovers relevant jobs, ranks them against a verified Career Brain, creates a truthful tailored application package for strong matches, prepares/submits supported applications under explicit user rules, tracks outcomes, and learns which applications generate interviews.

It is not an indiscriminate application spammer.

## Core user experience

The first-time experience should stay extremely simple:

1. Create account.
2. Upload one existing CV.
3. Review and verify the extracted Career Brain.
4. Choose target roles, locations, match threshold, and daily cap.
5. Start the Job Agent in review mode.
6. Agent searches continuously.
7. User sees explainable match scores.
8. Strong jobs get a unique tailored CV and application package.
9. Review mode requires approval before submission.
10. Autopilot can submit only when every guardrail passes.
11. Every successful browser submission should capture private proof when possible.
12. Interviews/offers/rejections feed the next scoring/tailoring cycle.

Users should not need to configure ATS internals during onboarding. Platform operators may maintain global job sources; advanced users can add sources later.

## Submission trust

For each submitted application retain, where available:

- exact job and match score;
- exact tailored resume version;
- truth-check result;
- application answers;
- submission timestamp and provider reference;
- private proof-of-submission screenshot.

If the browser reports success but proof capture fails, mark the application `submitted` with `proof_status=missing`. Never retry a possibly successful employer submission merely because the proof screenshot is absent.

## LinkedIn

LinkedIn is treated as a discovery signal rather than a required scraping backend.

Supported routes:

- user pastes a LinkedIn job URL;
- user forwards/connects LinkedIn job-alert emails;
- web/search providers may surface LinkedIn references;
- when possible, the system resolves the opportunity to the employer's canonical ATS/careers posting before processing/submission.

Do not build the product so losing LinkedIn access breaks job discovery.

## Default automation mode

- discovery: automatic;
- scoring: automatic;
- application package preparation: automatic;
- submission: user approval required.

Autopilot submission is separate opt-in and requires minimum score, daily cap, supported platform, no unresolved questions, no unsupported career claims, and no preference conflicts.

## Success metric

Optimize for interviews and offers per high-quality application, not raw submission count.


## Global-first

The default product serves job seekers worldwide. Job sources, search rules, currencies, locations, languages, work authorization, date/time formatting, and ATS coverage must not assume one country or region. Regional optimization is an explicit configuration layer.
