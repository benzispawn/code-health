# Spec Compliance

`code-health compare-spec` compares the codebase against `domain.spec.yaml`.

This connects Code Health to Spec Driven Development for NestJS.

## Command

```bash
code-health compare-spec
```

Fail CI when missing implementation is found:

```bash
code-health compare-spec --fail
```

Use a custom spec path:

```bash
code-health compare-spec --spec ./specs/domain.spec.yaml
```

## What It Checks Today

The current implementation checks existence of implementation symbols described in the spec.

Supported sections:

- controllers
- services
- repositories
- providers
- DTOs
- entities
- guards
- interceptors
- decorators
- pipes
- filters
- queues
- events
- cron
- use cases

Supported implementation details:

- class names
- exported function names
- exported const decorator factories
- route handlers
- method names under `methods:`

Example:

```yaml
controllers:
  - name: BillingController
    routes:
      - method: POST
        path: /change-plan
        handler: changePlan
services:
  - name: BillingService
    methods:
      - name: changePlan
decorators:
  - name: CurrentUser
```

The comparison expects:

- `BillingController` exists
- `BillingService` exists
- `changePlan` exists as a method or function
- `CurrentUser` exists as a class, function, or exported const function

## What It Ignores

Metadata names are not treated as implementation requirements.

Ignored examples:

- `project.name`
- `domains[].name`
- `path`
- HTTP method values like `POST`

This prevents false positives like expecting a class named `billing` or `email`.

## Current Limits

Spec comparison is intentionally basic today. It checks whether expected symbols exist, not whether every detail is semantically correct.

Not yet validated:

- DTO field shapes
- validation decorators
- route paths
- HTTP methods
- guard application
- provider registration in modules
- repository method signatures
- return types
- event payload shapes

These are natural next steps once the scanner moves from regex-based extraction to full AST analysis with `ts-morph`.

## How To Read Results

Passing output:

```txt
Spec checks: 4
Spec compliance: OK
```

Missing implementation:

```txt
Spec checks: 4
Missing implementation:
- identifier: BillingService
- method: changePlan
```

Use missing implementation results as SDD drift, not as generic code quality findings. They mean the implementation no longer matches the expected domain contract.
