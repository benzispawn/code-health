import { describe, expect, it } from 'vitest';
import { matchesPattern } from '../../src/core/scanner/file-scanner';

describe('matchesPattern', () => {
  it('matches nested include and exclude globs', () => {
    expect(matchesPattern('src/billing/billing.controller.ts', 'src/**/*.ts')).toBe(true);
    expect(matchesPattern('src/billing/billing.controller.spec.ts', '**/*.spec.ts')).toBe(true);
    expect(matchesPattern('src/billing/repositories/plan.repository.ts', '*/repositories/*.ts')).toBe(true);
  });
});
