# Configuration

`code-health init` creates:

```txt
code-health.config.ts
```

The config controls project metadata, scan scope, architecture rules, thresholds, scoring weights, and report output.

## Example

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
    exclude: [
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.module.ts',
      '**/node_modules/**',
      '**/dist/**',
    ],
  },

  architecture: {
    layers: {
      controller: ['*.controller.ts'],
      service: ['*.service.ts'],
      repository: ['*.repository.ts', '*/repositories/*.ts'],
      dto: ['*.dto.ts'],
      entity: ['*.entity.ts'],
      guard: ['*.guard.ts'],
      interceptor: ['*.interceptor.ts'],
      decorator: ['*.decorator.ts'],
      pipe: ['*.pipe.ts'],
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

## Project

| Field | Purpose |
| --- | --- |
| `name` | Display name in reports |
| `framework` | Project framework, currently `nestjs` or `typescript` |
| `sourceRoot` | Source directory to scan |
| `architecture` | Architecture style label |

## Scan Scope

Use `include` and `exclude` to control scanned files.

Default excludes skip tests, Nest modules, build output, and dependencies.

If module dependency checks become important for your project, remove `**/*.module.ts` from `exclude`.

## Architecture

`layers` map file patterns to architecture layers.

`rules` define disallowed imports.

Example:

```ts
{
  from: 'controller',
  disallow: ['repository'],
}
```

This means a controller file should not import a repository file.

## Thresholds

Thresholds define when a metric starts creating score penalties.

| Threshold | Default |
| --- | ---: |
| `cyclomaticComplexity` | 10 |
| `cognitiveComplexity` | 15 |
| `fileLength` | 300 |
| `functionLength` | 50 |
| `duplicationPercent` | 5 |
| `fanOut` | 12 |
| `maintainabilityIndex` | 65 |

Stricter teams can lower these values. Legacy projects may start higher and ratchet down over time.

## Scoring Weights

Weights must add up to 1.

Default:

```ts
scoring: {
  complexityWeight: 0.25,
  maintainabilityWeight: 0.2,
  couplingWeight: 0.2,
  architectureWeight: 0.2,
  testabilityWeight: 0.15,
}
```

Recommended adjustments:

- Increase `architectureWeight` for modular monoliths or SDD-heavy projects.
- Increase `testabilityWeight` when coverage data is integrated.
- Increase `complexityWeight` for domains with dense business rules.

## Reports

```ts
reports: {
  outputDir: './reports/code-health',
  formats: ['json', 'markdown'],
}
```

Supported formats:

- `json`
- `markdown`
- `html`

Use JSON for automation and Markdown for human review.
