# Metrics Roadmap

This roadmap expands Code Health from a first-pass static analysis CLI into a deeper code quality platform. The goal is not to add every possible metric. The goal is to add the metrics that most improve refactor prioritization, architectural feedback, and AI-assisted review quality.

## Current Baseline

The current implementation already covers:

- cyclomatic complexity
- cognitive complexity
- NPath estimates
- maintainability index
- file and function length
- parameter count
- duplication
- fan-in and fan-out
- dependency depth
- file and package cycles
- architecture violations
- LCOV line and branch coverage parsing
- git churn
- hotspots
- API surface counts
- basic spec comparison

Core extension seams:

- data model: `src/shared/types/project-health.ts`
- file scanning: `src/core/scanner/ts-morph-file-scanner.ts`
- project aggregation: `src/core/scanner/project-scanner.ts`
- scoring: `src/core/scoring/health-score-calculator.ts`
- hotspot ranking: `src/core/git/hotspot-calculator.ts`
- output: `src/core/reporting/**`

## Product Goal

Add the next metric layers in this order:

1. cohesion / LCOM
2. change coupling
3. stronger testability scoring
4. package stability metrics
5. CRAP-style risk scoring
6. dead code / unused export analysis

This order is intentional:

- cohesion closes the biggest design-quality gap
- change coupling adds historical architecture feedback
- testability improvements make existing scores more honest
- package stability deepens architecture analysis
- CRAP scoring becomes more useful after coverage work
- dead code analysis is valuable, but more framework-sensitive

## Delivery Model

Every new metric should move through the same lifecycle:

1. discovery
2. metric specification
3. tests first
4. scanner or analyzer implementation
5. aggregation
6. reporting
7. score integration if justified
8. docs and calibration

Do not add metrics directly into the overall score on the first pass unless the signal is already well calibrated.

## Default Workflow

For each metric:

1. Define the metric contract.
2. Decide the seam.
3. Add the smallest possible fixture.
4. Write focused unit tests first.
5. Add integration coverage only if CLI output changes.
6. Implement the minimal scanner or analyzer change.
7. Expose the metric in JSON and reports.
8. Decide whether it is:
   - report-only
   - recommendation-producing
   - score-affecting
   - hotspot-affecting

## Phase 0: Foundation

Purpose:

- establish a consistent rollout policy for new metrics
- avoid score inflation from overlapping penalties
- define how new metrics graduate into the main score

Work:

- classify new metrics as file-level, class-level, function-level, or package-level
- define whether each metric is report-only or score-affecting in v1
- prefer JSON and markdown exposure before terminal summary exposure
- keep thresholds explicit and documented

Deliverables:

- this roadmap
- follow-up updates to `docs/scoring.md` and `docs/metrics.md` when metrics land

## Phase 1: Cohesion / LCOM

Purpose:

- measure whether classes group related behavior or accumulate multiple responsibilities

Why first:

- it is the clearest missing design metric
- it fits the current `ts-morph` scanner well
- it adds strong value for Nest services and repositories

Initial scope:

- class-level cohesion only
- target services, repositories, controllers, domain classes
- skip interfaces and type aliases in v1

Implementation steps:

1. extend scanning to collect instance fields per class
2. collect method-to-field access relationships
3. implement LCOM or LCOM-HS calculation in a pure metric module
4. aggregate class cohesion into file-level reporting
5. expose cohesion in JSON and markdown
6. delay score penalties until fixtures prove the signal quality

Tests:

- unit tests for the cohesion formula
- scanner tests for field access extraction
- cohesive-class fixture
- low-cohesion fixture with mixed responsibilities

Acceptance:

- cohesive classes score better than mixed-responsibility classes
- tiny classes do not get noisy false positives
- output explains low cohesion in plain language

Risks:

- DI-heavy Nest classes may have few fields and many orchestration methods
- raw cohesion can over-flag thin adapters

Mitigation:

- treat tiny classes neutrally
- calibrate using focused fixtures before scoring

Deferred follow-ups:

- support constructor parameter properties in cohesion extraction
- detect more indirect field usage patterns beyond direct `this.field` access
- calibrate DI-heavy thin adapters before cohesion affects score or recommendations

## Phase 2: Change Coupling

Purpose:

- find files that repeatedly change together over time

Why second:

- churn alone shows activity
- change coupling shows hidden architectural relationships

Initial scope:

- file-level change coupling from local git history
- no author/team analysis in v1

Implementation steps:

1. parse commits into changed file sets
2. compute co-change pair frequencies
3. apply support thresholds to reduce noise
4. attach strongest coupled peers to each file
5. expose coupling in JSON and markdown
6. consider hotspot or recommendation integration after calibration

Tests:

- unit tests for pair counting
- unit tests for threshold filtering
- fallback tests when git history is unavailable

Acceptance:

- repeated co-change relationships are visible
- one-off large commits do not dominate results
- missing history degrades cleanly

Risks:

- merge commits and large formatting commits create noise

Mitigation:

- add minimum support thresholds
- consider ignoring very large commits in later phases

Deferred follow-ups:

- filter merge commits more explicitly if repo history proves noisy
- discount formatting-only or mechanically generated bulk commits
- decide later whether change coupling should affect recommendations, hotspots, or only reports

## Phase 3: Stronger Testability Scoring

Purpose:

- make score penalties better reflect risk in hard-to-test code

Current gap:

- line coverage affects score
- branch coverage is parsed but not used

Initial scope:

- combine line and branch coverage
- add complexity-aware coverage interpretation

Implementation steps:

1. revise testability scoring to use line and branch coverage
2. weight branch coverage more for high-complexity files
3. add recommendations for high complexity with weak coverage
4. preserve graceful fallback when coverage data is missing

Tests:

- scoring unit tests for line-only vs line-plus-branch cases
- fixtures with similar line coverage but different branch coverage
- missing-LCOV regression tests

Acceptance:

- branch-heavy code scores lower when branch coverage is weak
- simple files are not over-penalized

Risks:

- some repos publish line coverage only

Mitigation:

- fall back to line coverage without collapsing the whole score

Deferred follow-ups:

- calibrate the branch-weighting formula against real repositories before further score changes
- decide whether effective coverage should be surfaced explicitly in reports
- centralize effective coverage logic so scoring and recommendations do not drift
- decide later whether stronger testability should affect hotspots in addition to recommendations

## Phase 4: Package Stability Metrics

Purpose:

- measure package-level dependency stability instead of only file pressure

Initial scope:

- afferent coupling
- efferent coupling
- instability

Possible later scope:

- abstractness
- distance from main sequence

Implementation steps:

1. define package grouping rules
2. aggregate dependency graph edges to package level
3. compute package `Ca`, `Ce`, and instability
4. expose a package summary section in reports
5. add package-level recommendations for unstable boundaries

Tests:

- graph aggregation unit tests
- stable-core fixture
- unstable-package fixture
- boundary inversion fixture

Acceptance:

- package risk is distinguishable from file fan-in/fan-out
- reports surface which areas are stable, unstable, or overdepended-on

Risks:

- package grouping can vary between repos

Mitigation:

- allow grouping strategy or overrides through config in a later slice

## Phase 5: CRAP-Style Risk Scoring

Purpose:

- highlight complex logic that is insufficiently protected by tests

Why after Phase 3:

- CRAP-style scoring depends on coverage quality

Initial scope:

- file-level CRAP-style score first
- function-level CRAP later if signal quality justifies the added detail

Implementation steps:

1. define the formula and thresholds
2. compute CRAP-style score from complexity and coverage
3. expose it in JSON and markdown
4. add recommendation mapping
5. optionally feed it into hotspots

Tests:

- formula unit tests
- high-complexity low-coverage cases
- high-complexity high-coverage cases
- low-complexity low-coverage cases

Acceptance:

- risky untested logic stands out clearly
- well-tested complex code is distinguished from under-tested complex code

Risks:

- different teams expect different formulas

Mitigation:

- document the formula explicitly
- keep thresholds configurable if needed

## Phase 6: Dead Code / Unused Export Analysis

Purpose:

- identify exports or modules that are likely removable

Why later:

- framework behavior makes this more error-prone than pure structural metrics

Initial scope:

- unused internal exports
- likely-unused modules

Out of scope for v1:

- broad reflection-aware certainty
- external package consumer analysis

Implementation steps:

1. enumerate exports
2. resolve internal import references
3. identify exports with no internal consumers
4. add ignore rules for framework-discovered entrypoints
5. report candidates conservatively

Tests:

- unused-export fixture
- barrel-export fixture
- Nest-discovered entrypoint fixture

Acceptance:

- obviously unused exports are surfaced
- NestJS reflection patterns do not trigger aggressive false positives

Risks:

- static analysis cannot always prove runtime usage

Mitigation:

- classify findings as candidates, not guaranteed dead code

## Cross-Cutting Rules

### Scoring Governance

Avoid double-counting the same smell.

Examples:

- do not penalize long methods, low maintainability, and low cohesion so heavily that one design flaw dominates the score unfairly
- do not move a metric into project score until its fixtures and output are trustworthy

Recommended promotion order:

1. JSON only
2. markdown and HTML reports
3. recommendations
4. file score
5. project score
6. hotspot weighting

### Fixture Strategy

- keep fixtures small
- prefer one fixture per smell
- avoid giant fixtures that test many unrelated signals at once

### Reporting Strategy

- add new metrics to JSON first
- promote to markdown and HTML once interpretation is stable
- only add to terminal summary when the metric is consistently high-signal

### Validation Strategy

Run the smallest relevant validation step first:

- pure metric math: focused unit tests
- scanner extraction: scanner unit tests
- user-visible output: integration tests

Broaden only when:

- shared score composition changes
- hotspot ranking changes
- JSON or markdown report shape changes

## Hotspot Evolution

Current hotspot ranking is simpler than the docs imply. It primarily reflects complexity and churn, while architecture risk is computed separately.

Target evolution:

1. complexity + churn
2. add architecture weighting
3. add change coupling weighting
4. add CRAP or testability weighting

The goal is to rank change pain, not only busy files.

## Milestones

### Milestone A

- foundation completed
- cohesion exposed in JSON
- no score changes yet

### Milestone B

- cohesion integrated into recommendations
- scoring decision made for cohesion
- docs updated

### Milestone C

- change coupling available in reports
- hotspot evolution starts

### Milestone D

- testability score upgraded
- CRAP-style score introduced

### Milestone E

- package stability metrics available
- package-level recommendations added

### Milestone F

- dead code candidates available
- score and hotspot recalibration reviewed

## Definition Of Done Per Milestone

Each milestone should include:

- metric math tests
- scanner or analyzer tests
- fixture coverage
- output coverage where user-visible
- docs updates
- explicit statement whether score changed
- explicit statement whether hotspot ranking changed

## Recommended First Sprint

Start with the smallest vertical slice:

1. add cohesion fixtures
2. add LCOM formula tests
3. extend scanning for fields and field access
4. expose cohesion in JSON only
5. do not change project score yet

This preserves a clean red -> green path and gives calibration room before the score model changes.
