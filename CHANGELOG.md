# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/) (pre-1.0, so
minor bumps may include breaking changes).

## [0.2.0] - 2026-09-26

### Added
- Class cohesion (LCOM-HS) metric per class, including constructor
  parameter properties (`constructor(private readonly foo: Foo)`) as
  instance fields, not just declared class properties — the common
  NestJS dependency-injection style.
- Change coupling analysis from local git history: files that repeatedly
  change together, surfaced as coupled peers per file.
- Effective coverage (blended line + branch coverage, weighted by
  complexity) and a CRAP-style risk score, both feeding into hotspot
  ranking and refactor recommendations.
- Package stability metrics (afferent coupling, efferent coupling,
  instability) per package, with:
  - configurable package grouping via `architecture.packageGroups`
    (glob-based overrides for repos that don't map cleanly to
    directories)
  - configurable thresholds via `thresholds.packageInstabilityThreshold`
    and `thresholds.packageEfferentCouplingThreshold`
- Conservative unused-export (dead code) candidate detection, surfaced
  in terminal output, markdown reports, and recommendations.
- `code-health scan <path>` accepts a positional project root
  (equivalent to `--cwd <path>`), and JSON reports now include a `scan`
  section (`root`, `generatedAt`, `scannedFileCount`) for provenance.

### Changed
- **Breaking:** `HealthThresholds` now requires
  `packageInstabilityThreshold` and `packageEfferentCouplingThreshold`.
  Existing `code-health.config.ts` files built with `defineConfig()`
  need these two fields added. Defaults (`0.8` and `2`) match the
  previously hardcoded behavior, so runtime output is unchanged if you
  adopt the defaults.

### Fixed
- Cohesion analysis previously only read declared class properties, so
  it undercounted fields for most real NestJS services and controllers
  (which inject dependencies via constructor parameter properties
  rather than declared fields). Constructor-injected fields are now
  recognized and correctly credited as used.

## [0.1.0] - Initial release

- CLI scanning for NestJS and TypeScript projects: cyclomatic and
  cognitive complexity, NPath estimates, maintainability index, file
  and function length, parameter count, duplication detection, fan-in
  and fan-out, dependency depth, file and package cycle detection.
- Architecture rule validation against configurable layers and rules.
- Domain spec comparison against a `domain.spec.yaml`.
- Git churn and hotspot ranking.
- API surface counts, JSON and markdown reporting.
- `code-health init`, `scan`, `score`, `report`, `duplication`,
  `hotspots`, `compare-spec`, `suggest-refactor`, and
  `validate-architecture` commands.
