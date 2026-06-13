import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../../src/config/default-config';
import { scanProject } from '../../src/core/scanner/project-scanner';

describe('API surface and package cycle metrics', () => {
  it('counts public exports, controllers, and endpoints', () => {
    const cwd = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/clean-valid',
    );
    const report = scanProject({
      cwd,
      config: DEFAULT_CONFIG,
      includeGit: false,
    });

    expect(report.summary.publicExportCount).toBe(3);
    expect(report.summary.controllerCount).toBe(1);
    expect(report.summary.endpointCount).toBe(1);
    expect(report.summary.apiSurfaceSize).toBe(5);
  });

  it('detects package-level cycles', () => {
    const cwd = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/package-cycle',
    );
    const report = scanProject({
      cwd,
      config: DEFAULT_CONFIG,
      includeGit: false,
    });

    expect(report.summary.packageCycleCount).toBeGreaterThan(0);
    expect(report.architecture.packageCycles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          files: expect.arrayContaining(['src/a', 'src/b']),
        }),
      ]),
    );
    expect(report.architecture.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rule: 'package-cycle',
        }),
      ]),
    );
  });
});
