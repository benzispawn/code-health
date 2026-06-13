import type { ProjectHealthReport } from "../../shared/types/project-health";
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
} from "./rating";

export function formatTerminalSummary(report: ProjectHealthReport): string[] {
  const lines = [
    `Project Health: ${report.summary.score}/100 ${formatRating(rateScore(report.summary.score))}`,
    "",
    "Critical Findings:",
  ];

  const critical = report.architecture.violations.filter(
    (violation) => violation.severity === "error",
  );
  if (critical.length === 0) {
    lines.push("- None");
  } else {
    lines.push(
      ...critical
        .slice(0, 8)
        .map((violation) => `- ${violation.file}: ${violation.message}`),
    );
  }

  lines.push("", "Top Refactor Priorities:");
  if (report.hotspots.length === 0) {
    lines.push("- None");
  } else {
    lines.push(
      ...report.hotspots
        .slice(0, 5)
        .map(
          (hotspot, index) =>
            `${index + 1}. ${hotspot.file} - ${hotspot.priority} (${hotspot.refactorPriority}/100)`,
        ),
    );
  }

  lines.push(
    "",
    "Score Breakdown:",
    `- Architecture: ${report.summary.architectureScore}/100 ${formatRating(rateScore(report.summary.architectureScore))}`,
    `- Complexity: ${report.summary.complexityScore}/100 ${formatRating(rateScore(report.summary.complexityScore))}`,
    `- Maintainability: ${report.summary.maintainabilityScore}/100 ${formatRating(rateScore(report.summary.maintainabilityScore))}`,
    `- Coupling: ${report.summary.couplingScore}/100 ${formatRating(rateScore(report.summary.couplingScore))}`,
    `- Testability: ${report.summary.testabilityScore}/100 ${formatRating(rateScore(report.summary.testabilityScore))}`,
    "",
    "Risk Signals:",
    `- Duplication: ${report.summary.duplicationPercent}% ${formatRating(rateDuplication(report.summary.duplicationPercent))}`,
    `- Max Dependency Depth: ${report.summary.maxDependencyDepth} ${formatRating(rateDependencyDepth(report.summary.maxDependencyDepth))}`,
    `- API Surface Size: ${report.summary.apiSurfaceSize} ${formatRating(rateApiSurface(report.summary.apiSurfaceSize))}`,
    `- Public Exports: ${report.summary.publicExportCount} ${formatRating(ratePublicExports(report.summary.publicExportCount))}`,
    `- Controllers: ${report.summary.controllerCount} ${formatRating(rateControllerCount(report.summary.controllerCount))}`,
    `- Endpoints: ${report.summary.endpointCount} ${formatRating(rateEndpointCount(report.summary.endpointCount))}`,
    `- Package Cycles: ${report.summary.packageCycleCount} ${formatRating(ratePackageCycles(report.summary.packageCycleCount))}`,
    `- Line Coverage: ${formatPercent(report.summary.averageLineCoverage)} ${formatRating(rateCoverage(report.summary.averageLineCoverage))}`,
    `- Branch Coverage: ${formatPercent(report.summary.averageBranchCoverage)} ${formatRating(rateCoverage(report.summary.averageBranchCoverage))}`,
  );

  return lines;
}

function formatPercent(value: number | undefined): string {
  return value === undefined ? "not found" : `${value}%`;
}
