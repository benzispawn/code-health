# @rbenzi/code-health

Spec-driven architecture health CLI for NestJS and TypeScript projects.

It analyzes:

- complexity metrics
- maintainability scores
- dependency graph
- architecture violations
- domain boundary violations
- git churn hotspots
- refactor priority
- SDD/spec compliance

## Documentation

- [Scoring Guide](docs/scoring.md): what each score means and how to read good, risky, and critical results.
- [Metrics Reference](docs/metrics.md): complexity, maintainability, coupling, testability, and git risk thresholds.
- [Reports Guide](docs/reports.md): how to read terminal, JSON, Markdown, and HTML reports.
- [Architecture Rules](docs/architecture-rules.md): layer rules, domain boundaries, circular dependencies, and severity.
- [Spec Compliance](docs/spec-compliance.md): how `domain.spec.yaml` comparison works and what it checks.
- [Configuration](docs/configuration.md): config file structure, thresholds, weights, and report options.

## Install

```bash
npm i -D @rbenzi/code-health
```

## CLI

```bash
code-health init
code-health scan
code-health scan --domain billing
code-health score
code-health report
code-health report --format markdown
code-health validate-architecture --fail
code-health hotspots
code-health compare-spec --fail
code-health suggest-refactor
```

## How To Read The Score

Code Health uses a 0-100 score. Treat it as a prioritization signal, not a perfect judgment.

| Score | Meaning | Action |
| --- | --- | --- |
| 90-100 | Excellent | Keep current standards; watch new violations |
| 80-89 | Good | Minor cleanup only |
| 70-79 | Acceptable | Review hotspots before adding major features |
| 60-69 | Needs attention | Plan targeted refactors |
| 40-59 | Risky | Fix architecture, complexity, or test gaps soon |
| 0-39 | Critical | Avoid expanding this area before remediation |

The project score is weighted from complexity, maintainability, coupling, architecture, and testability. See [Scoring Guide](docs/scoring.md) for the full explanation.

## Configuration

`code-health init` creates `code-health.config.ts`:

```ts
import { defineConfig } from '@rbenzi/code-health';

export default defineConfig({
  project: {
    name: 'email-saas',
    framework: 'nestjs',
    sourceRoot: 'src',
    architecture: 'layered',
  },
  spec: {
    enabled: true,
    file: './domain.spec.yaml',
  },
  scan: {
    include: ['src/**/*.ts'],
    exclude: ['**/*.spec.ts', '**/*.test.ts', '**/*.module.ts', '**/node_modules/**', '**/dist/**'],
  },
  architecture: {
    layers: {
      controller: ['*.controller.ts'],
      service: ['*.service.ts'],
      repository: ['*.repository.ts', '*/repositories/*.ts'],
      dto: ['*.dto.ts'],
      entity: ['*.entity.ts'],
      domain: ['*/domain/**/*.ts'],
      infrastructure: ['*/infrastructure/**/*.ts'],
    },
    rules: [
      { from: 'controller', disallow: ['repository'] },
      { from: 'domain', disallow: ['infrastructure'] },
    ],
  },
  thresholds: {
    cyclomaticComplexity: 10,
    cognitiveComplexity: 15,
    fileLength: 300,
    functionLength: 50,
    duplicationPercent: 5,
    fanOut: 12,
    maintainabilityIndex: 65,
  },
  scoring: {
    complexityWeight: 0.25,
    maintainabilityWeight: 0.2,
    couplingWeight: 0.2,
    architectureWeight: 0.2,
    testabilityWeight: 0.15,
  },
  reports: {
    outputDir: './reports/code-health',
    formats: ['json', 'markdown'],
  },
});
```

## Current Scope

This package implements the CLI foundation and first-pass static analysis with `ts-morph`. The scanner extracts imports, classes, methods, functions, exported const decorator factories, NestJS-style layers, LOC, cyclomatic complexity, cognitive complexity, fan-in/fan-out, architecture violations, circular dependencies, git churn, hotspots, recommendations, and basic `domain.spec.yaml` compliance checks.

The next natural phase is enriching the AST model with NestJS metadata so spec comparison can validate decorators, DTO fields, provider registration, guards, route methods, and route paths.
