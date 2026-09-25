# Vision Governance

The App Factory uses a project-level `VISION.md` as a durable acceptance policy for what a product should and should not become.

## Why this exists

`PRODUCT_SPEC_TEMPLATE.md` defines what is being built now.
`VISION.md` defines the boundaries that should remain true as the product evolves.
`AGENTS.md` defines how coding agents must apply those boundaries.

The goal is to prevent feature drift, architecture drift, and agent-driven scope expansion across many products.

## Included skill

This starter vendors the MIT-licensed `kunchenguid/vision` Agent Skill under:

```text
skills/vision/
  SKILL.md
  LICENSE
  SOURCE.json
  assets/
    review-template.html
    review.css
```

Upstream project: `kunchenguid/vision`.
Pinned source metadata is stored in `skills/vision/SOURCE.json`; update the vendored skill deliberately rather than silently drifting upstream.

The skill mines real repository history, drafts a `VISION.md`, and stress-tests it with difficult product hypotheticals before the author approves it.

## When to create VISION.md

Do not invent a vision at repository creation time just to fill a file.
The skill is deliberately evidence-driven.

Recommended lifecycle:

```text
Day 0
  -> PRODUCT_SPEC.md
  -> build the MVP
  -> make real product decisions
  -> accumulate meaningful commits / merged PRs

After the product has evidence
  -> run /vision
  -> inspect evidence-mined draft
  -> answer fault-line hypotheticals
  -> approve VISION.md

Later
  -> run /vision again
  -> delta mode proposes only evidence-backed changes
```

A practical trigger is roughly 10-30 meaningful commits, several merged PRs, or enough accepted/rejected product decisions to reveal recurring principles.
This is guidance, not a hard numeric gate.

## Agent feature gate

When `VISION.md` exists, every coding agent must read it before implementing a material scope change.

Classify the proposal as:

- **Aligned** - clearly satisfies the vision's positive acceptance criteria.
- **Resisted** - clearly falls into an explicit non-goal or negative criterion.
- **Ambiguous** - creates a genuine tradeoff or expands product identity.

Behavior:

```text
Aligned
  -> continue normally

Resisted
  -> do not silently implement
  -> explain the conflict and ask for an explicit product decision

Ambiguous
  -> surface the tradeoff
  -> ask for a decision or run /vision to calibrate the boundary
```

The human product owner always has authority to change the vision.
Agents must not rewrite or weaken it simply to make a requested feature fit.

## Product files and their roles

| File | Role |
|---|---|
| `PRODUCT_SPEC.md` | Current product requirements and MVP scope |
| `VISION.md` | Durable product acceptance policy after calibration |
| `AGENTS.md` | Instructions coding agents must obey |
| `ARCHITECTURE.md` | Technical structure and boundaries |
| `SECURITY.md` | Security/release requirements |
| `COSTS.md` | Cost and unit-economics constraints |
| `VISION_ANSWERS.md` or equivalent | Durable reasoning/verdict record produced during calibration |

## Running the included skill

If the agent harness supports local Agent Skills, point it at the vendored skill in `skills/vision/`.
The upstream install route is also available:

```bash
npx skills add kunchenguid/vision -g
```

Then run from inside the target repository:

```text
/vision
```

or target another repository explicitly:

```text
/vision owner/repo
```

The review board uses the shipped assets and `npx -y lavish-axi` as described in `skills/vision/SKILL.md`.

## Pull-request policy

For any material PR after `VISION.md` exists, the author/agent should state one of:

```text
Vision: aligned - <why>
Vision: ambiguous - <tradeoff requiring decision>
Vision: exception approved - <link/reference to decision>
```

A PR should not claim alignment without referencing an actual acceptance criterion or boundary from `VISION.md`.

## Updating the vision

Do not rewrite `VISION.md` opportunistically during feature work.
Use the vision skill's delta mode or an explicit product-owner decision.
Keep the recorded answers/changelog next to the vision so future agents can understand why a boundary exists.
