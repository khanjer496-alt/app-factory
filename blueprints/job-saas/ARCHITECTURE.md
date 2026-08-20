# Job SaaS Architecture

```text
Cloudflare Cron / user trigger
        |
        v
Discovery service
  | Greenhouse
  | Lever
  | Ashby
  | SmartRecruiters
  | Workday via browser discovery provider
  | URL / email leads
  | web provider seam
        |
        v
Normalizer + dedupe
        |
        v
Rule filter
        |
        v
GPT-5.6 Luna match score
        |
        v
Strong-match threshold
        |
        v
Resume tailor -> truth verifier -> question answers
        |
        v
Application package + state machine
        |
        +--> Review queue
        |
        +--> Autopilot guardrails
                 |
                 v
        Cloudflare Queue
                 |
                 v
        Browser/ATS submit provider
                 |
        final success screenshot -> private R2 proof
                 |
                 v
        Application events/outcomes
                 |
                 v
        Learning signals
```

## Cloudflare responsibilities

- Workers/Hono: API and orchestration.
- D1: Career Brain, jobs, matches, applications, state and outcomes.
- R2: original CVs, tailored PDFs, private submission screenshots and application artifacts.
- Queues: bulk application execution with controlled concurrency.
- Cron/Workflows: continuous discovery and durable multi-step preparation/submission.
- Analytics Engine: cost/usage and product events.
- Browser Run: preferred browser automation runtime when the target form requires browser interaction.

## Model routing

Default `gpt-5.6-luna` for extraction, match scoring, resume tailoring, question classification and truth QA. Escalate only low-confidence or difficult cases to a stronger configured model.

Always set OpenAI Responses API `store: false` for career/application content unless the product deliberately chooses otherwise.


## Global-first

The default product serves job seekers worldwide. Job sources, search rules, currencies, locations, languages, work authorization, date/time formatting, and ATS coverage must not assume one country or region. Regional optimization is an explicit configuration layer.
