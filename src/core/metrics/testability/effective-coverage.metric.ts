import type { CodeHealthConfig } from '../../../shared/types/config';
import type { FileAnalysis } from '../../../shared/types/project-health';

export function calculateEffectiveCoverage(
  file: Pick<FileAnalysis, 'metrics'>,
  config: Pick<CodeHealthConfig, 'thresholds'>,
): number | undefined {
  const lineCoverage = file.metrics.lineCoverage;
  const branchCoverage = file.metrics.branchCoverage;

  if (lineCoverage === undefined) {
    return undefined;
  }
  if (branchCoverage === undefined) {
    return lineCoverage;
  }

  const complexity = Math.max(
    file.metrics.cyclomaticComplexity,
    file.metrics.cognitiveComplexity,
  );
  const complexityThreshold = Math.max(
    config.thresholds.cyclomaticComplexity,
    config.thresholds.cognitiveComplexity,
  );
  const complexityFactor = Math.min(
    1,
    complexity / Math.max(1, complexityThreshold * 2),
  );
  const branchWeight = 0.2 + complexityFactor * 0.4;
  const lineWeight = 1 - branchWeight;

  return Math.round(lineCoverage * lineWeight + branchCoverage * branchWeight);
}
