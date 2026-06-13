# Metrics Reference

This page explains the metric thresholds used by Code Health and how to interpret them.

Thresholds are configurable in `code-health.config.ts`. The values below are practical defaults for NestJS and TypeScript services.

## Complexity

### Cyclomatic Complexity

Cyclomatic complexity estimates how many execution paths exist in a function.

| Value | Rating | Meaning |
| ---: | --- | --- |
| 1-5 | Good | Simple path structure |
| 6-10 | Acceptable | Some branching, still manageable |
| 11-20 | Risky | Harder to test exhaustively |
| 21+ | Critical | Strong refactor candidate |

Common causes:

- many `if` branches
- `switch` statements
- loops
- `catch` blocks
- boolean operators like `&&` and `||`

What to do:

- extract named decision functions
- use guard clauses
- move policy decisions into strategies or domain services
- split orchestration from business rules

### Cognitive Complexity

Cognitive complexity estimates how difficult the function is for a person to understand.

| Value | Rating | Meaning |
| ---: | --- | --- |
| 1-7 | Good | Easy to read |
| 8-15 | Acceptable | Review if the function changes often |
| 16-30 | Risky | Refactor soon |
| 31+ | Critical | Very difficult to reason about safely |

Common causes:

- nested conditionals
- nested loops
- mixed responsibilities
- long procedural workflows

What to do:

- flatten nesting with early returns
- extract private methods
- introduce small policy objects
- move long workflows into explicit steps

### Function Length

| Lines | Rating |
| ---: | --- |
| 1-25 | Good |
| 26-50 | Acceptable |
| 51-100 | Risky |
| 101+ | Critical |

Long functions are not always wrong, but they deserve attention when combined with branching, churn, or low test coverage.

### Parameter Count

| Parameters | Rating |
| ---: | --- |
| 0-3 | Good |
| 4-5 | Acceptable |
| 6+ | Risky |

High parameter count often means the function wants an input object, DTO, command, or domain value object.

## Maintainability

### Maintainability Index

Code Health normalizes maintainability index to a 0-100 score.

| Score | Rating |
| ---: | --- |
| 80-100 | Good |
| 65-79 | Acceptable |
| 40-64 | Risky |
| 0-39 | Critical |

Low maintainability usually means several signals are present at once: file length, complexity, and too many functions.

### File Length

| Lines | Rating |
| ---: | --- |
| 1-200 | Good |
| 201-300 | Acceptable |
| 301-500 | Risky |
| 501+ | Critical |

For NestJS services, long files often indicate that application orchestration, business policy, persistence, and integration code have merged.

## Coupling

### Fan-out

Fan-out is the number of imports a file has.

| Imports | Rating |
| ---: | --- |
| 0-6 | Good |
| 7-12 | Acceptable |
| 13-20 | Risky |
| 21+ | Critical |

High fan-out is especially risky in controllers and services because it can indicate too many responsibilities.

### Fan-in

Fan-in is the number of files importing a file.

High fan-in is not always bad. It can mean the file is a stable shared abstraction. It becomes risky when the file also has high complexity, high churn, or low test coverage.

### Circular Dependencies

Circular dependencies are architecture findings, not just coupling findings.

They make module boundaries harder to understand and can cause runtime problems in NestJS dependency injection.

### Dependency Depth

Dependency depth is the longest outgoing dependency chain from a file.

| Depth | Rating |
| ---: | --- |
| 0-2 | Good |
| 3-5 | Acceptable |
| 6-8 | Risky |
| 9+ | Critical |

Deep chains can make changes harder to reason about because a file indirectly depends on many implementation details.

## Testability

Code Health reads LCOV coverage from:

```txt
coverage/lcov.info
```

Supported coverage metrics:

- line coverage
- branch coverage

If no coverage signal is available for a file, Code Health uses a neutral default for testability scoring instead of assuming the file is well tested.

## Git Risk

### Churn

Churn is how often a file has changed recently.

High churn is not bad by itself. It becomes important when combined with:

- high complexity
- architecture violations
- low maintainability
- low test confidence

## Architecture Surface

### API Surface Size

API surface combines:

- public exports
- public controllers
- public endpoints

A large API surface is not automatically bad, but it increases the amount of behavior that other code can depend on.

### Package Cycles

Package cycles are circular dependencies between directories/packages rather than only individual files.

They indicate that module boundaries may be unclear even when the file-level cycle is small.

## Recommended Reading Order

When reviewing a report:

1. Check architecture errors.
2. Check hotspots.
3. Check files with high cognitive complexity.
4. Check low maintainability files.
5. Check coupling only after understanding the feature boundary.
