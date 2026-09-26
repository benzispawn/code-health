import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../../src/config/default-config';
import { calculateHealthSummary } from '../../src/core/scoring/health-score-calculator';
import type {
  ArchitectureAnalysis,
  FileAnalysis,
} from '../../src/shared/types/project-health';

describe('calculateHealthSummary', () => {
  it('uses branch coverage to reduce testability for complex files', () => {
    const simpleFile = createFile({
      path: 'src/simple.ts',
      lineCoverage: 80,
      branchCoverage: 20,
      cyclomaticComplexity: 2,
      cognitiveComplexity: 2,
    });
    const complexFile = createFile({
      path: 'src/complex.ts',
      lineCoverage: 80,
      branchCoverage: 20,
      cyclomaticComplexity: 20,
      cognitiveComplexity: 20,
    });

    const simpleSummary = calculateHealthSummary(
      [simpleFile],
      createArchitecture(),
      DEFAULT_CONFIG,
    );
    const complexSummary = calculateHealthSummary(
      [complexFile],
      createArchitecture(),
      DEFAULT_CONFIG,
    );

    expect(simpleSummary.testabilityScore).toBeGreaterThan(
      complexSummary.testabilityScore,
    );
    expect(complexSummary.testabilityScore).toBeLessThan(80);
  });

  it('falls back to line coverage when branch coverage is unavailable', () => {
    const summary = calculateHealthSummary(
      [
        createFile({
          path: 'src/no-branch.ts',
          lineCoverage: 72,
          branchCoverage: undefined,
          cyclomaticComplexity: 12,
          cognitiveComplexity: 10,
        }),
      ],
      createArchitecture(),
      DEFAULT_CONFIG,
    );

    expect(summary.testabilityScore).toBe(72);
    expect(summary.averageLineCoverage).toBe(72);
    expect(summary.averageBranchCoverage).toBeUndefined();
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
  lineCoverage?: number;
  branchCoverage?: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
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
      coverage: input.lineCoverage,
      lineCoverage: input.lineCoverage,
      branchCoverage: input.branchCoverage,
    },
    score: 100,
  };
}
