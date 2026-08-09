# Context

## What This Package Does
`@rbenzi/code-health` is a CLI for static code-health analysis of NestJS and TypeScript projects. It scores maintainability and architecture risk, validates dependency rules, reports duplication and hotspots, and compares code against a lightweight `domain.spec.yaml`.

## Public Seams
- CLI command dispatch through `runCli()` in `src/cli/main.ts`
- Individual CLI commands in `src/cli/commands/*.command.ts`
- Scanner orchestration through `scanProject()` in `src/core/scanner/project-scanner.ts`
- Architecture validation through `validateArchitecture()` in `src/core/architecture/architecture-validator.ts`
- Spec comparison through `compareSpecToReport()` in `src/core/spec/spec-comparator.ts`

## Current Domain Areas
- CLI parsing and command execution
- File and project scanning with `ts-morph`
- Complexity, maintainability, coverage, coupling, and duplication metrics
- Dependency graph analysis and architecture rule enforcement
- Score aggregation and report rendering
- Spec loading, validation, and comparison
- Git churn and hotspot scoring

## Test Strategy
- `tests/unit/**` covers pure logic and scanner behavior.
- `tests/integration/**` covers CLI behavior against fixture projects or temp directories.
- `tests/fixtures/projects/**` are the source of truth for analysis scenarios.

## Important Invariants
- Commands should remain scriptable and text-first.
- Fixture projects should stay small and purpose-built.
- New analysis behavior should be exercised through representative fixtures.
- The package should build before integration tests because integration helpers import from `dist/`.

## Common Pitfalls
- Changing CLI help text can break integration assertions.
- Over-broad fixtures make failures harder to localize.
- Pure logic changes often need both a unit test and an integration assertion if user-visible output changes.
