import { scanFromFlags } from './command-utils';
import {
  formatRating,
  rateApiSurface,
  rateControllerCount,
  rateCoverage,
  rateDependencyDepth,
  rateDuplication,
  rateEndpointCount,
  ratePackageCycles,
  ratePublicExports,
  rateScore,
} from '../../core/reporting/rating';

export async function scoreCommand(
  flags: Record<string, string | boolean>,
): Promise<void> {
  const report = await scanFromFlags(flags);
  console.log(
    `Project Health: ${report.summary.score}/100 ${formatRating(rateScore(report.summary.score))}`,
  );
  console.log('');
  console.log('Score Breakdown:');
  console.log(
    `- Architecture: ${report.summary.architectureScore}/100 ${formatRating(rateScore(report.summary.architectureScore))}`,
  );
  console.log(
    `- Complexity: ${report.summary.complexityScore}/100 ${formatRating(rateScore(report.summary.complexityScore))}`,
  );
  console.log(
    `- Maintainability: ${report.summary.maintainabilityScore}/100 ${formatRating(rateScore(report.summary.maintainabilityScore))}`,
  );
  console.log(
    `- Coupling: ${report.summary.couplingScore}/100 ${formatRating(rateScore(report.summary.couplingScore))}`,
  );
  console.log(
    `- Testability: ${report.summary.testabilityScore}/100 ${formatRating(rateScore(report.summary.testabilityScore))}`,
  );
  console.log('');
  console.log('Risk Signals:');
  console.log(
    `- Duplication: ${report.summary.duplicationPercent}% ${formatRating(rateDuplication(report.summary.duplicationPercent))}`,
  );
  console.log(
    `- Max Dependency Depth: ${report.summary.maxDependencyDepth} ${formatRating(rateDependencyDepth(report.summary.maxDependencyDepth))}`,
  );
  console.log(
    `- API Surface Size: ${report.summary.apiSurfaceSize} ${formatRating(rateApiSurface(report.summary.apiSurfaceSize))}`,
  );
  console.log(
    `- Public Exports: ${report.summary.publicExportCount} ${formatRating(ratePublicExports(report.summary.publicExportCount))}`,
  );
  console.log(
    `- Controllers: ${report.summary.controllerCount} ${formatRating(rateControllerCount(report.summary.controllerCount))}`,
  );
  console.log(
    `- Endpoints: ${report.summary.endpointCount} ${formatRating(rateEndpointCount(report.summary.endpointCount))}`,
  );
  console.log(
    `- Package Cycles: ${report.summary.packageCycleCount} ${formatRating(ratePackageCycles(report.summary.packageCycleCount))}`,
  );
  console.log(
    `- Line Coverage: ${formatPercent(report.summary.averageLineCoverage)} ${formatRating(rateCoverage(report.summary.averageLineCoverage))}`,
  );
  console.log(
    `- Branch Coverage: ${formatPercent(report.summary.averageBranchCoverage)} ${formatRating(rateCoverage(report.summary.averageBranchCoverage))}`,
  );
}

function formatPercent(value: number | undefined): string {
  return value === undefined ? 'not found' : `${value}%`;
}
