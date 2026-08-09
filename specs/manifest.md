# Spec Manifest

## Purpose
This repo does not use product feature specs like the comparison project. This manifest maps agent work to the existing source-of-truth docs and code seams.

## Domain Map

### CLI
- Source:
  - `src/cli/main.ts`
  - `src/cli/commands/*.command.ts`
- Tests:
  - `tests/integration/*.spec.ts`
- Supporting docs:
  - `README.md`

### Scoring And Metrics
- Source:
  - `src/core/metrics/**`
  - `src/core/scoring/**`
  - `src/core/reporting/rating.ts`
- Tests:
  - `tests/unit/rating.spec.ts`
  - `tests/unit/mvp-metrics.spec.ts`
- Supporting docs:
  - `docs/scoring.md`
  - `docs/metrics.md`

### Architecture Analysis
- Source:
  - `src/core/architecture/**`
  - `src/core/scanner/project-scanner.ts`
- Tests:
  - `tests/unit/project-scanner.spec.ts`
  - `tests/unit/api-surface-and-package-cycles.spec.ts`
- Supporting docs:
  - `docs/architecture-rules.md`

### Spec Compliance
- Source:
  - `src/core/spec/**`
- Tests:
  - `tests/unit/spec-validator.spec.ts`
  - `tests/unit/spec-comparator.spec.ts`
  - `tests/integration/cli-compare-spec.spec.ts`
- Supporting docs:
  - `docs/spec-compliance.md`

### Reports
- Source:
  - `src/core/reporting/**`
- Tests:
  - relevant integration tests under `tests/integration/`
- Supporting docs:
  - `docs/reports.md`

### Configuration
- Source:
  - `src/config/**`
  - `src/cli/commands/init.command.ts`
- Tests:
  - `tests/integration/cli-init.spec.ts`
- Supporting docs:
  - `docs/configuration.md`

## Loading Rule
Open only the section relevant to the active task plus its directly linked source, tests, and docs.
