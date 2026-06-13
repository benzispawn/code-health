# Reports Guide

Code Health can print a terminal summary and generate report files.

## Terminal Summary

`code-health scan` prints a compact summary with colored ratings:

```txt
Project Health: 74/100 (Medium)

Critical Findings:
- billing.service.ts has cognitive complexity 31
- payment.controller.ts imports payment.repository.ts directly

Top Refactor Priorities:
1. billing.service.ts
2. subscription.service.ts

Score Breakdown:
- Architecture: 68/100 (Medium)
- Complexity: 71/100 (Medium)
- Maintainability: 76/100 (Medium)
- Coupling: 88/100 (Good)
- Testability: 61/100 (Medium)

Risk Signals:
- Duplication: 15% (Bad)
- Max Dependency Depth: 8 (Medium)
- API Surface Size: 353 (Extreme Bad)
- Package Cycles: 1 (Bad)
- Line Coverage: 98% (Excellent)
- Branch Coverage: 93% (Excellent)
```

Use the terminal summary for quick local feedback.

## Duplication Inspection

Use the dedicated command when the summary shows high duplication:

```bash
code-health duplication
```

Example output:

```txt
Duplication: 15% (Bad)

Top Duplicate Blocks:

1. 8 lines repeated in 2 locations (High)
   - src/billing/billing.service.ts:42-49
   - src/billing/subscription.service.ts:88-95
```

You can also append duplicate block details to the normal scan output:

```bash
code-health scan --duplication
```

Useful options:

```bash
code-health duplication --limit 5
code-health duplication --show-code
code-health duplication --json
```

Default output shows locations only. `--show-code` prints the normalized duplicated block text. `--json` returns machine-readable duplication data.

## JSON Report

Generate JSON:

```bash
code-health report --format json
```

Default path:

```txt
reports/code-health/code-health-report.json
```

Use JSON for:

- CI checks
- dashboards
- custom scripts
- comparing results over time

Main sections:

| Section | Purpose |
| --- | --- |
| `project` | Project metadata |
| `summary` | Overall score and category scores |
| `files` | Per-file metrics, API surface counts, coverage, duplication, and scores |
| `domains` | Domain-level summary |
| `architecture` | Violations, file cycles, package cycles, dependency graph |
| `duplication` | Project duplication percent and repeated block locations |
| `hotspots` | Refactor priority ranking |
| `recommendations` | Suggested next actions |

## Markdown Report

Generate Markdown:

```bash
code-health report --format markdown
```

Default path:

```txt
reports/code-health/code-health-report.md
```

Use Markdown for:

- pull request artifacts
- architecture review notes
- lightweight team sharing

Markdown reports include a `## Duplication` section with repeated block locations.

## HTML Report

Generate HTML:

```bash
code-health report --format html
```

Default path:

```txt
reports/code-health/code-health-report.html
```

The current HTML report is intentionally simple. It is useful as a standalone file, but the Markdown and JSON reports are the strongest formats today.

## How To Triage A Report

Do not start with the longest list. Start with the highest-risk signal.

Recommended order:

1. Architecture errors
2. Circular dependencies
3. Hotspots
4. Very high refactor priorities
5. Files with high cognitive complexity
6. Files with high churn
7. Low maintainability files

## What Not To Do

Avoid treating the report as a command to refactor everything.

Good usage:

- pick the top 1-3 hotspots
- fix architecture violations first
- add tests before changing complex code
- improve files when they are already being touched

Bad usage:

- rewrite all low-score files at once
- chase small score changes with cosmetic refactors
- ignore domain context and business criticality
- treat generated code the same as hand-written domain code
