# Scoring Guide

Code Health scores are designed to answer one question:

> Where is this codebase becoming harder to change safely?

The score is a prioritization signal. A low score does not automatically mean code is broken, and a high score does not prove code is perfect. It tells you where to inspect first.

## Score Scale

| Score | Rating | Meaning | Recommended action |
| --- | --- | --- | --- |
| 90-100 | Excellent | Very little structural risk detected | Keep standards stable and monitor regressions |
| 80-89 | Good | Healthy code with minor issues | Clean up opportunistically |
| 70-79 | Acceptable | Usable, but some areas are getting harder to change | Review hotspots before large feature work |
| 60-69 | Needs attention | Several maintainability or architecture risks exist | Plan targeted refactors |
| 40-59 | Risky | Changes are likely to be slower and more fragile | Fix the highest-priority findings soon |
| 0-39 | Critical | The area is difficult to change safely | Avoid expanding it before remediation |

## Project Health Score

The project score combines five category scores:

| Category | Default weight | What it represents |
| --- | ---: | --- |
| Complexity | 25% | Branching, nesting, and function difficulty |
| Maintainability | 20% | File size, function count, and maintainability index |
| Coupling | 20% | Fan-out and dependency pressure |
| Architecture | 20% | Layer, domain boundary, and circular dependency findings |
| Testability | 15% | Current test confidence signals |

Default formula:

```txt
Project Health =
  complexityScore * 0.25
  + maintainabilityScore * 0.20
  + couplingScore * 0.20
  + architectureScore * 0.20
  + testabilityScore * 0.15
```

You can change these weights in `code-health.config.ts`.

## Category Scores

### Complexity Score

High complexity means the code has many paths to reason about. This usually increases bug risk and makes tests harder to write.

Good signals:

- functions are short
- branching is limited
- nesting is shallow
- business rules are split into named operations

Bad signals:

- large `if`/`else` chains
- nested loops or conditionals
- methods that mix validation, orchestration, persistence, and external calls

### Maintainability Score

Maintainability reflects how easy a file is to understand and change.

Good signals:

- file has one clear responsibility
- functions have clear names and small bodies
- file length stays below configured thresholds

Bad signals:

- large services with many unrelated methods
- files that accumulate several responsibilities
- low maintainability index

### Coupling Score

Coupling measures dependency pressure. A file with many outgoing imports can become hard to move, test, or reuse.

Good signals:

- imports are local and intentional
- dependencies point inward toward stable abstractions
- service boundaries are clear

Bad signals:

- controllers importing repositories directly
- domain code importing infrastructure
- a file importing many unrelated modules

### Architecture Score

Architecture starts at 100 and loses points for violations.

Examples:

- controller imports repository directly
- domain imports infrastructure
- one domain imports another domain's `internal` code
- circular dependency exists

Architecture errors are usually more important than raw complexity because they spread change risk across the project.

### Testability Score

The current implementation uses available test confidence signals. When no coverage data is available, the score uses a neutral default rather than pretending confidence is high.

Current LCOV support includes line and branch coverage. Future versions can add mutation score, untested critical files, and test-to-code ratios.

## File Score

Each file also receives a score. File scores consider:

- cyclomatic complexity
- cognitive complexity
- file length
- function length
- parameter count
- fan-out
- maintainability index
- duplication percent

Use file scores to find concrete places to inspect after reading the project summary.

## Risk Signal Ratings

Risk signals use metric-specific ratings. Higher is better for scores and coverage; lower is better for duplication, dependency depth, API surface, and package cycles.

Examples:

| Metric | Excellent | Medium | Extreme Bad |
| --- | ---: | ---: | ---: |
| Duplication | 0-2% | 6-10% | 21%+ |
| Dependency Depth | 0-2 | 5-8 | 13+ |
| API Surface Size | 0-25 | 76-150 | 301+ |
| Package Cycles | 0 | n/a | 2+ |
| Coverage | 90-100% | 60-79% | 0-39% |

These ratings are meant to guide review priority. A large API surface is not always wrong, but it means more public behavior can depend on the module.

## Hotspot Priority

Hotspots combine:

```txt
complexity + git churn + architecture risk
```

A hotspot is not always the worst-written file. It is the file most likely to cause pain because risk signals overlap.

Use hotspot priority like this:

| Priority | Meaning |
| --- | --- |
| Very High | Inspect before feature work; likely refactor candidate |
| High | Review soon; isolate risk before expanding behavior |
| Medium | Watch and improve when touching the file |
| Low | Known signal, but not urgent by itself |

## Example Interpretation

```txt
Project Health: 74/100

Architecture Score: 68/100
Complexity Score: 71/100
Maintainability Score: 76/100
Testability Score: 61/100
```

This is acceptable but not comfortable. The first action should be architecture review because the architecture score is the lowest. Do not start by rewriting the largest file unless it is also a hotspot or part of the architecture findings.
