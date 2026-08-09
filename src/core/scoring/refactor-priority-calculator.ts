import type {
  CodeHealthConfig,
} from '../../shared/types/config';
import type {
  ArchitectureAnalysis,
  FileAnalysis,
  PackageStabilityAnalysis,
  RefactorRecommendation,
} from '../../shared/types/project-health';
import { priorityLabel } from '../git/hotspot-calculator';
import { calculateEffectiveCoverage } from '../metrics/testability/effective-coverage.metric';

export function createRefactorRecommendations(
  files: FileAnalysis[],
  architecture: ArchitectureAnalysis,
  packageStability: PackageStabilityAnalysis[] = [],
  config?: Pick<CodeHealthConfig, 'thresholds'>,
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

    const effectiveCoverage =
      config === undefined
        ? file.metrics.lineCoverage
        : calculateEffectiveCoverage(file, config);
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

  for (const pkg of packageStability) {
    if (pkg.instability >= 0.8 && pkg.efferentCoupling >= 2) {
      recommendations.push({
        file: pkg.packagePath,
        type: 'reduce-coupling',
        priority: priorityLabel(
          Math.min(100, Math.round(pkg.instability * 50) + pkg.efferentCoupling * 15),
        ),
        reason: `Package instability is ${pkg.instability} with Ce ${pkg.efferentCoupling} and Ca ${pkg.afferentCoupling}`,
      });
    }
  }

  return recommendations.sort(
    (left, right) => priorityRank(right.priority) - priorityRank(left.priority),
  );
}

function priorityRank(priority: RefactorRecommendation['priority']): number {
  return ['Low', 'Medium', 'High', 'Very High'].indexOf(priority);
}
