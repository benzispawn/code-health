import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../../src/config/default-config';
import { scanProject } from '../../src/core/scanner/project-scanner';

describe('ts-morph scanner', () => {
  it('resolves tsconfig path aliases for architecture checks', () => {
    const cwd = path.resolve(process.cwd(), 'tests/fixtures/projects/path-alias-invalid');
    const report = scanProject({ cwd, config: DEFAULT_CONFIG, includeGit: false });

    expect(report.files.find((file) => file.path === 'src/billing/billing.controller.ts')?.imports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: '@billing/repositories/plan.repository',
          resolvedPath: 'src/billing/repositories/plan.repository.ts',
          isRelative: false,
        }),
      ]),
    );
    expect(report.architecture.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: 'src/billing/billing.controller.ts',
          importedFile: 'src/billing/repositories/plan.repository.ts',
          rule: 'controller-must-not-import-repository',
        }),
      ]),
    );
  });

  it('resolves simple barrel exports to the declaring file', () => {
    const cwd = path.resolve(process.cwd(), 'tests/fixtures/projects/barrel-invalid');
    const report = scanProject({ cwd, config: DEFAULT_CONFIG, includeGit: false });

    expect(report.files.find((file) => file.path === 'src/billing/billing.controller.ts')?.imports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: './repositories',
          resolvedPath: 'src/billing/repositories/plan.repository.ts',
          isRelative: true,
        }),
      ]),
    );
    expect(report.architecture.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: 'src/billing/billing.controller.ts',
          importedFile: 'src/billing/repositories/plan.repository.ts',
          rule: 'controller-must-not-import-repository',
        }),
      ]),
    );
  });
});
