import type {
  ArchitectureAnalysis,
  FileAnalysis,
  RefactorRecommendation,
} from '../../shared/types/project-health';
import { priorityLabel } from '../git/hotspot-calculator';

export function createRefactorRecommendations(
  files: FileAnalysis[],
  architecture: ArchitectureAnalysis,
): RefactorRecommendation[] {
  const recommendations: RefactorRecommendation[] = [];

  for (const file of files) {
    const worstFunction = [...file.functions].sort(
      (left, right) => right.cognitiveComplexity - left.cognitiveComplexity,
    )[0];

    if (worstFunction && worstFunction.cognitiveComplexity >= 15) {
      recommendations.push({
        file: file.path,
        type: 'extract-method',
        priority: priorityLabel(
          Math.min(100, worstFunction.cognitiveComplexity * 4),
        ),
        reason: `${worstFunction.name} has cognitive complexity ${worstFunction.cognitiveComplexity}`,
      });
    }

    if (file.layer === 'service' && file.functions.length >= 10) {
      recommendations.push({
        file: file.path,
        type: 'split-service',
        priority: 'High',
        reason: `Service exposes ${file.functions.length} functions; consider splitting responsibilities`,
      });
    }

    if (file.metrics.fanOut >= 12) {
      recommendations.push({
        file: file.path,
        type: 'reduce-coupling',
        priority: priorityLabel(Math.min(100, file.metrics.fanOut * 6)),
        reason: `Fan-out is ${file.metrics.fanOut}`,
      });
    }

    const effectiveCoverage = calculateEffectiveCoverage(file);
    const complexity = Math.max(
      file.metrics.cyclomaticComplexity,
      file.metrics.cognitiveComplexity,
    );
    if (
      effectiveCoverage !== undefined &&
      effectiveCoverage <= 70 &&
      complexity >= 2
    ) {
      recommendations.push({
        file: file.path,
        type: 'add-tests',
        priority: priorityLabel(
          Math.min(100, (70 - effectiveCoverage) * 2 + complexity * 5),
        ),
        reason: `Effective coverage is ${effectiveCoverage}% for complexity ${complexity}`,
      });
    }
  }

  for (const violation of architecture.violations) {
    recommendations.push({
      file: violation.file,
      type: 'fix-architecture',
      priority: violation.severity === 'error' ? 'High' : 'Medium',
      reason: violation.message,
    });
  }

  return recommendations.sort(
    (left, right) => priorityRank(right.priority) - priorityRank(left.priority),
  );
}

function priorityRank(priority: RefactorRecommendation['priority']): number {
  return ['Low', 'Medium', 'High', 'Very High'].indexOf(priority);
}

function calculateEffectiveCoverage(file: FileAnalysis): number | undefined {
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
  const branchWeight = complexity >= 15 ? 0.6 : complexity >= 8 ? 0.4 : 0.2;
  const lineWeight = 1 - branchWeight;

  return Math.round(lineCoverage * lineWeight + branchCoverage * branchWeight);
}
