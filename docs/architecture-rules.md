# Architecture Rules

Architecture checks help enforce dependency direction and domain boundaries.

The default rules target common NestJS layered architecture problems.

## Layers

Layers are inferred from file patterns in `code-health.config.ts`.

Default examples:

```ts
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
}
```

## Rules

Rules describe imports that are not allowed.

```ts
rules: [
  {
    from: 'controller',
    disallow: ['repository'],
  },
  {
    from: 'domain',
    disallow: ['infrastructure'],
  },
]
```

This means:

- a controller should go through a service, not directly to a repository
- domain code should not depend on infrastructure code

## Severity

| Severity | Meaning |
| --- | --- |
| `warning` | Review the dependency; it may be acceptable with context |
| `error` | The dependency violates a configured architecture rule |

Today, configured layer violations and circular dependencies are emitted as errors.

## Common Findings

### Controller imports repository directly

Example:

```txt
payment.controller.ts imports payment.repository.ts directly
```

Why it matters:

- controller starts owning persistence decisions
- validation, orchestration, and data access become coupled
- service layer becomes bypassed

What to do:

- inject a service into the controller
- move repository calls into the service
- keep controller logic focused on HTTP concerns

### Domain imports infrastructure

Example:

```txt
billing/domain/plan.entity.ts imports billing/infrastructure/stripe.adapter.ts
```

Why it matters:

- domain rules become coupled to technical details
- tests need infrastructure dependencies
- changing providers can affect domain behavior

What to do:

- depend on a port or interface
- move infrastructure implementation outward
- keep domain rules framework-light

### Cross-domain internal import

Example:

```txt
users imports billing/internal/subscription.mapper.ts
```

Why it matters:

- one domain depends on another domain's private implementation
- changes in billing can break users unexpectedly

What to do:

- expose a public API from the owning domain
- use an application service, event, or query interface
- move shared concepts into an explicit shared module only when justified

### Circular dependency

Example:

```txt
billing.service.ts -> payment.service.ts -> billing.service.ts
```

Why it matters:

- dependency direction is unclear
- NestJS provider resolution may become fragile
- tests and refactors become harder

What to do:

- extract shared behavior into a third service
- invert one dependency behind an interface
- use events for cross-domain workflows

## Architecture Score

Architecture starts at 100 and loses points for findings. Errors have a larger penalty than warnings.

Low architecture score should usually be addressed before raw complexity because architecture issues spread across files and modules.
