import { describe, expect, it } from 'vitest';
import { createRefactorRecommendations } from '../../src/core/scoring/refactor-priority-calculator';
import type { CodeHealthConfig } from '../../src/shared/types/config';
import type {
  ArchitectureAnalysis,
  PackageStabilityAnalysis,
} from '../../src/shared/types/project-health';

const architecture: ArchitectureAnalysis = {
  score: 100,
  violations: [],
  circularDependencies: [],
  packageCycles: [],
  dependencyGraph: { nodes: [], edges: [] },
};

const packageStability: PackageStabilityAnalysis[] = [
  {
    packagePath: 'src/domain',
    afferentCoupling: 1,
    efferentCoupling: 2,
    instability: 0.7,
  },
];

function thresholds(
  overrides: Partial<CodeHealthConfig['thresholds']>,
): Pick<CodeHealthConfig, 'thresholds'> {
  return {
    thresholds: {
      cyclomaticComplexity: 10,
      cognitiveComplexity: 15,
      fileLength: 300,
      functionLength: 50,
      duplicationPercent: 5,
      fanOut: 12,
      maintainabilityIndex: 65,
      packageInstabilityThreshold: 0.8,
      packageEfferentCouplingThreshold: 2,
      ...overrides,
    },
  };
}

describe('createRefactorRecommendations package stability thresholds', () => {
  it('does not flag a package below the configured instability threshold', () => {
    const recommendations = createRefactorRecommendations(
      [],
      architecture,
      packageStability,
      [],
      thresholds({}),
    );

    expect(recommendations.some((item) => item.file === 'src/domain')).toBe(
      false,
    );
  });

  it('flags the same package once the instability threshold is configured lower', () => {
    const recommendations = createRefactorRecommendations(
      [],
      architecture,
      packageStability,
      [],
      thresholds({ packageInstabilityThreshold: 0.6 }),
    );

    expect(recommendations.some((item) => item.file === 'src/domain')).toBe(
      true,
    );
  });
});
