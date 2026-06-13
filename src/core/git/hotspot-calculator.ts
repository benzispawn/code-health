import {
  ArchitectureAnalysis,
  FileAnalysis,
  HotspotAnalysis,
} from '../../shared/types/project-health';

export function calculateHotspots(files: FileAnalysis[], architecture: ArchitectureAnalysis): HotspotAnalysis[] {
  const maxChurn = Math.max(1, ...files.map((file) => file.metrics.churn ?? 0));

  return files
    .map((file) => {
      const complexityScore = Math.min(100, Math.max(file.metrics.cyclomaticComplexity, file.metrics.cognitiveComplexity) * 5);
      const churnScore = Math.round(((file.metrics.churn ?? 0) / maxChurn) * 100);
      const architectureRisk = architecture.violations.some((violation) => violation.file === file.path) ? 100 : 20;
      const refactorPriority = Math.round(
        (complexityScore * 0.45) + (churnScore * 0.35) + (architectureRisk * 0.2),
      );

      return {
        file: file.path,
        complexityScore,
        churnScore,
        architectureRisk,
        refactorPriority,
        priority: priorityLabel(refactorPriority),
      };
    })
    .filter((hotspot) => hotspot.refactorPriority >= 20)
    .sort((left, right) => right.refactorPriority - left.refactorPriority);
}

export function priorityLabel(score: number): HotspotAnalysis['priority'] {
  if (score >= 80) {
    return 'Very High';
  }
  if (score >= 60) {
    return 'High';
  }
  if (score >= 35) {
    return 'Medium';
  }
  return 'Low';
}
