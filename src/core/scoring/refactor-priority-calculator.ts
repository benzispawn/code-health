import { ArchitectureAnalysis, FileAnalysis, RefactorRecommendation } from '../../shared/types/project-health';
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
        priority: priorityLabel(Math.min(100, worstFunction.cognitiveComplexity * 4)),
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
  }

  for (const violation of architecture.violations) {
    recommendations.push({
      file: violation.file,
      type: 'fix-architecture',
      priority: violation.severity === 'error' ? 'High' : 'Medium',
      reason: violation.message,
    });
  }

  return recommendations.sort((left, right) => priorityRank(right.priority) - priorityRank(left.priority));
}

function priorityRank(priority: RefactorRecommendation['priority']): number {
  return ['Low', 'Medium', 'High', 'Very High'].indexOf(priority);
}
