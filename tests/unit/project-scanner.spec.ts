import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../../src/config/default-config';
import { scanProject } from '../../src/core/scanner/project-scanner';

describe('scanProject', () => {
  it('detects controller to repository architecture violations', () => {
    const cwd = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/layered-invalid',
    );
    const report = scanProject({
      cwd,
      config: DEFAULT_CONFIG,
      includeGit: false,
    });

    expect(report.files.map((file) => file.path)).toContain(
      'src/billing/billing.controller.ts',
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

  it('detects decorator files and const decorator exports as functions', () => {
    const cwd = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/clean-valid',
    );
    const report = scanProject({
      cwd,
      config: DEFAULT_CONFIG,
      includeGit: false,
    });
    const decoratorFile = report.files.find((file) =>
      file.path.endsWith('current-user.decorator.ts'),
    );

    expect(decoratorFile?.layer).toBe('decorator');
    expect(decoratorFile?.functions.map((fn) => fn.name)).toContain(
      'CurrentUser',
    );
  });

  it('captures class cohesion and file average LCOM-HS for scanned files', () => {
    const cwd = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/cohesion-sample',
    );
    const report = scanProject({
      cwd,
      config: DEFAULT_CONFIG,
      includeGit: false,
    });
    const cohesiveFile = report.files.find((file) =>
      file.path.endsWith('cohesive.service.ts'),
    );
    const mixedFile = report.files.find((file) =>
      file.path.endsWith('mixed-responsibility.service.ts'),
    );

    expect(cohesiveFile?.classes[0]).toEqual(
      expect.objectContaining({
        instanceFields: ['plans', 'usage'],
        cohesion: expect.objectContaining({
          fieldCount: 2,
          methodCount: 3,
          lcomHs: 0,
        }),
      }),
    );
    expect(cohesiveFile?.metrics.averageLcomHs).toBe(0);
    expect(mixedFile?.classes[0]).toEqual(
      expect.objectContaining({
        instanceFields: ['plans', 'usage', 'mailer'],
        cohesion: expect.objectContaining({
          fieldCount: 3,
          methodCount: 3,
          lcomHs: 1,
        }),
      }),
    );
    expect(mixedFile?.metrics.averageLcomHs).toBe(1);
  });
});
