# Test Protocol

## Goal
Choose the smallest command that validates the changed seam, then broaden only if the change affects shared behavior.

## Default Mapping
- CLI parser or command output:
  - start with the matching file in `tests/integration/`
- Scanner, metrics, scoring, architecture, spec logic:
  - start with the matching file in `tests/unit/`
- Shared types, config loading, or output formatting:
  - run the nearest focused unit or integration test first

## Commands
- Focused unit coverage:
  - `npm run test:unit`
- Focused integration coverage:
  - `npm run test:integration`
- Full suite:
  - `npm test`
- Type safety:
  - `npm run typecheck`
- Build output required by integration tests:
  - `npm run build`

## Expected Workflow
1. Add or update the smallest relevant test first for behavior changes.
2. Run the narrowest command that exercises the changed seam.
3. Implement the minimal production change.
4. Re-run the same narrow command.
5. Run broader validation only when shared behavior changed.

## When To Broaden Validation
- Multiple commands share the changed utility.
- Public CLI output changed in more than one command.
- Shared config, shared types, or report rendering changed.
- Build output structure changed.

## Reporting
Always report:
- tests added or changed
- commands run
- pass or fail status
- remaining validation not executed
