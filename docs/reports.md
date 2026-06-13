# Reports Guide

Code Health can print a terminal summary and generate report files.

## Terminal Summary

`code-health scan` prints a compact summary:

```txt
Project Health: 74/100

Critical Findings:
- billing.service.ts has cognitive complexity 31
- payment.controller.ts imports payment.repository.ts directly

Top Refactor Priorities:
1. billing.service.ts
2. subscription.service.ts

Architecture Score: 68/100
Complexity Score: 71/100
Maintainability Score: 76/100
Testability Score: 61/100
```

Use the terminal summary for quick local feedback.

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
| `files` | Per-file metrics and scores |
| `domains` | Domain-level summary |
| `architecture` | Violations, cycles, dependency graph |
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
