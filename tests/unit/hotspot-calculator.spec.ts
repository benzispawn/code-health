import { describe, expect, it } from 'vitest';
import { calculateHotspots } from '../../src/core/git/hotspot-calculator';
import type {
  ArchitectureAnalysis,
  FileAnalysis,
} from '../../src/shared/types/project-health';

describe('calculateHotspots', () => {
  it('uses CRAP score to prioritize risky under-tested files', () => {
    const lowCrap = createFile({
      path: 'src/low-crap.ts',
      cyclomaticComplexity: 10,
      cognitiveComplexity: 10,
      churn: 10,
      crapScore: 12,
    });
    const highCrap = createFile({
      path: 'src/high-crap.ts',
      cyclomaticComplexity: 10,
      cognitiveComplexity: 10,
      churn: 10,
      crapScore: 45,
    });

    const hotspots = calculateHotspots(
      [lowCrap, highCrap],
      createArchitecture(),
    );

    expect(hotspots[0]?.file).toBe('src/high-crap.ts');
    expect(hotspots[0]?.refactorPriority).toBeGreaterThan(
      hotspots[1]?.refactorPriority ?? 0,
    );
  });
});

function createArchitecture(): ArchitectureAnalysis {
  return {
    score: 100,
    violations: [],
    circularDependencies: [],
    packageCycles: [],
    dependencyGraph: { nodes: [], edges: [] },
  };
}

function createFile(input: {
  path: string;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  churn: number;
  crapScore?: number;
}): FileAnalysis {
  return {
    path: input.path,
    loc: 10,
    functions: [],
    classes: [],
    imports: [],
    changeCoupling: [],
    metrics: {
      maintainabilityIndex: 80,
      cyclomaticComplexity: input.cyclomaticComplexity,
      cognitiveComplexity: input.cognitiveComplexity,
      npathComplexity: 1,
      physicalLoc: 10,
      logicalLoc: 5,
      commentLines: 0,
      commentRatio: 0,
      duplicationPercent: 0,
      dependencyDepth: 0,
      publicExportCount: 0,
      controllerCount: 0,
      endpointCount: 0,
      fanIn: 0,
      fanOut: 0,
      averageLcomHs: undefined,
      crapScore: input.crapScore,
      churn: input.churn,
      coverage: 80,
      lineCoverage: 80,
      branchCoverage: 80,
    },
    score: 100,
  };
}
