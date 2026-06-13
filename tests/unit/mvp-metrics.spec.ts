import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../../src/config/default-config';
import { scanProject } from '../../src/core/scanner/project-scanner';

describe('MVP metrics integration', () => {
  it('reports duplication, comments, logical LOC, coverage, and dependency depth', () => {
    const cwd = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/mvp-metrics',
    );
    const report = scanProject({
      cwd,
      config: DEFAULT_CONFIG,
      includeGit: false,
    });
    const controller = report.files.find(
      (file) => file.path === 'src/billing/billing.controller.ts',
    );
    const service = report.files.find(
      (file) => file.path === 'src/billing/billing.service.ts',
    );
    const helper = report.files.find(
      (file) => file.path === 'src/billing/billing.helper.ts',
    );

    expect(controller?.metrics.commentLines).toBe(1);
    expect(controller?.metrics.commentRatio).toBeGreaterThan(0);
    expect(controller?.metrics.logicalLoc).toBeGreaterThan(0);
    expect(controller?.metrics.physicalLoc).toBeGreaterThanOrEqual(
      controller?.loc ?? 0,
    );
    expect(controller?.metrics.lineCoverage).toBe(75);
    expect(controller?.metrics.branchCoverage).toBe(50);

    expect(service?.metrics.duplicationPercent).toBeGreaterThan(0);
    expect(helper?.metrics.duplicationPercent).toBeGreaterThan(0);
    expect(report.summary.duplicationPercent).toBeGreaterThan(0);

    expect(controller?.metrics.dependencyDepth).toBe(2);
    expect(service?.metrics.dependencyDepth).toBe(1);
    expect(helper?.metrics.dependencyDepth).toBe(0);
    expect(report.summary.maxDependencyDepth).toBe(2);
    expect(report.summary.averageLineCoverage).toBe(75);
    expect(report.summary.averageBranchCoverage).toBe(50);
    expect(report.duplication.percent).toBeGreaterThan(0);
    expect(report.duplication.groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          occurrences: expect.arrayContaining([
            expect.objectContaining({ file: 'src/billing/billing.helper.ts' }),
            expect.objectContaining({ file: 'src/billing/billing.service.ts' }),
          ]),
        }),
      ]),
    );
  });
});
