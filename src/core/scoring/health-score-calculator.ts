import { CodeHealthConfig } from '../../shared/types/config';
import { ArchitectureAnalysis, FileAnalysis, HealthSummary } from '../../shared/types/project-health';

export function applyFileScores(files: FileAnalysis[], config: CodeHealthConfig): FileAnalysis[] {
  return files.map((file) => ({
    ...file,
    score: calculateFileScore(file, config),
  }));
}

export function calculateHealthSummary(
  files: FileAnalysis[],
  architecture: ArchitectureAnalysis,
  config: CodeHealthConfig,
): HealthSummary {
  const complexityScore = average(
    files.map((file) =>
      scoreThreshold(
        Math.max(file.metrics.cyclomaticComplexity, file.metrics.cognitiveComplexity),
        Math.max(config.thresholds.cyclomaticComplexity, config.thresholds.cognitiveComplexity),
      ),
    ),
  );
  const maintainabilityScore = average(files.map((file) => file.metrics.maintainabilityIndex));
  const couplingScore = average(files.map((file) => scoreThreshold(file.metrics.fanOut, config.thresholds.fanOut)));
  const architectureScore = architecture.score;
  const testabilityScore = average(files.map((file) => (file.metrics.coverage === undefined ? 50 : file.metrics.coverage)));
  const weights = config.scoring;
  const score = Math.round(
    complexityScore * weights.complexityWeight +
      maintainabilityScore * weights.maintainabilityWeight +
      couplingScore * weights.couplingWeight +
      architectureScore * weights.architectureWeight +
      testabilityScore * weights.testabilityWeight,
  );

  return {
    score,
    complexityScore: Math.round(complexityScore),
    maintainabilityScore: Math.round(maintainabilityScore),
    couplingScore: Math.round(couplingScore),
    architectureScore: Math.round(architectureScore),
    testabilityScore: Math.round(testabilityScore),
    fileCount: files.length,
    functionCount: files.reduce((total, file) => total + file.functions.length, 0),
    criticalFindingCount: architecture.violations.filter((violation) => violation.severity === 'error').length,
  };
}

function calculateFileScore(file: FileAnalysis, config: CodeHealthConfig): number {
  let score = 100;
  score -= overThresholdPenalty(file.metrics.cyclomaticComplexity, config.thresholds.cyclomaticComplexity, 2);
  score -= overThresholdPenalty(file.metrics.cognitiveComplexity, config.thresholds.cognitiveComplexity, 2);
  score -= overThresholdPenalty(file.loc, config.thresholds.fileLength, 0.1);
  score -= overThresholdPenalty(file.metrics.fanOut, config.thresholds.fanOut, 2);
  score -= Math.max(0, config.thresholds.maintainabilityIndex - file.metrics.maintainabilityIndex);

  for (const fn of file.functions) {
    score -= overThresholdPenalty(fn.loc, config.thresholds.functionLength, 0.5);
    score -= overThresholdPenalty(fn.parameterCount, 5, 2);
  }

  return Math.max(0, Math.round(score));
}

function scoreThreshold(value: number, threshold: number): number {
  if (value <= threshold) {
    return 100;
  }
  return Math.max(0, Math.round(100 - ((value - threshold) / threshold) * 100));
}

function overThresholdPenalty(value: number, threshold: number, multiplier: number): number {
  return value > threshold ? (value - threshold) * multiplier : 0;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 100;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
}
