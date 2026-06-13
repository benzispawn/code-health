import { ProjectHealthReport } from '../../shared/types/project-health';

export function formatTerminalSummary(report: ProjectHealthReport): string[] {
  const lines = [
    `Project Health: ${report.summary.score}/100`,
    '',
    'Critical Findings:',
  ];

  const critical = report.architecture.violations.filter((violation) => violation.severity === 'error');
  if (critical.length === 0) {
    lines.push('- None');
  } else {
    lines.push(...critical.slice(0, 8).map((violation) => `- ${violation.file}: ${violation.message}`));
  }

  lines.push('', 'Top Refactor Priorities:');
  if (report.hotspots.length === 0) {
    lines.push('- None');
  } else {
    lines.push(...report.hotspots.slice(0, 5).map((hotspot, index) => `${index + 1}. ${hotspot.file}`));
  }

  lines.push(
    '',
    `Architecture Score: ${report.summary.architectureScore}/100`,
    `Complexity Score: ${report.summary.complexityScore}/100`,
    `Maintainability Score: ${report.summary.maintainabilityScore}/100`,
    `Testability Score: ${report.summary.testabilityScore}/100`,
  );

  return lines;
}
