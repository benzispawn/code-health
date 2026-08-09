import { describe, expect, it } from 'vitest';
import {
  calculatePackageStability,
  packagePathForFile,
} from '../../src/core/metrics/coupling/package-stability.metric';
import type { DependencyGraph } from '../../src/shared/types/project-health';

describe('packagePathForFile', () => {
  it('groups files by their parent directory', () => {
    expect(packagePathForFile('src/billing/billing.controller.ts')).toBe(
      'src/billing',
    );
    expect(packagePathForFile('src/main.ts')).toBe('src');
  });
});

describe('calculatePackageStability', () => {
  it('computes afferent coupling, efferent coupling, and instability', () => {
    const graph: DependencyGraph = {
      nodes: ['src/app', 'src/domain', 'src/shared'],
      edges: [
        { from: 'src/app', to: 'src/domain' },
        { from: 'src/app', to: 'src/shared' },
        { from: 'src/domain', to: 'src/shared' },
      ],
    };

    expect(calculatePackageStability(graph)).toEqual([
      {
        packagePath: 'src/app',
        afferentCoupling: 0,
        efferentCoupling: 2,
        instability: 1,
      },
      {
        packagePath: 'src/domain',
        afferentCoupling: 1,
        efferentCoupling: 1,
        instability: 0.5,
      },
      {
        packagePath: 'src/shared',
        afferentCoupling: 2,
        efferentCoupling: 0,
        instability: 0,
      },
    ]);
  });
});
