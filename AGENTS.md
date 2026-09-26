# AGENTS.md

## Purpose
Runtime guidance for AI agents working in this repository.

## Authority Order
1. `AGENTS.md`
2. `CONTEXT.md`
3. `specs/manifest.md`
4. relevant files under `docs/`
5. `README.md`

If instructions conflict, prefer the more specific file for the active task.

## Core Rules
- Plan before editing.
- Keep diffs minimal and scoped to the user request.
- Do not change public CLI behavior silently.
- Do not add dependencies unless the task requires them.
- Prefer tests at public seams over implementation-coupled tests.
- Preserve the current package layout unless the task explicitly requires restructuring.

## Repo Shape
- CLI entrypoint: `src/cli/main.ts`
- CLI commands: `src/cli/commands/*.command.ts`
- Static analysis core: `src/core/**`
- Shared types and utilities: `src/shared/**`, `src/config/**`
- Public package entrypoint: `src/index.ts`
- Unit tests: `tests/unit/**`
- Integration tests: `tests/integration/**`
- Fixture projects: `tests/fixtures/projects/**`

## Task Routing

### CLI Behavior
Load:
- `CONTEXT.md`
- `src/cli/main.ts`
- relevant command file under `src/cli/commands/`
- matching integration tests under `tests/integration/`

### Scanning, Metrics, Architecture, Spec Comparison
Load:
- `CONTEXT.md`
- `specs/manifest.md`
- relevant module under `src/core/`
- matching unit tests under `tests/unit/`
- relevant fixture projects under `tests/fixtures/projects/`

### Docs or Repo Workflow
Load:
- `CONTEXT.md`
- `specs/manifest.md`
- directly relevant docs under `docs/`

## TDD Rules
- Default to red -> green for behavior changes.
- Confirm the seam before writing tests.
- Use unit tests for pure analysis logic.
- Use integration tests for CLI output and filesystem behavior.
- Run the smallest relevant test command first.
- If behavior changes, update tests in the same change.

## Validation Rules
- Prefer `npm run test:unit -- --runInBand` only if the existing command supports extra args.
- Use the repo's defined scripts when possible:
  - `npm run test:unit`
  - `npm run test:integration`
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
- Report the exact commands run and any commands not run.

## Documentation Rules
- Prefer referencing existing docs rather than repeating them.
- Keep agent-facing docs short and operational.
- Put stable product behavior in `docs/`, not in agent control files.
