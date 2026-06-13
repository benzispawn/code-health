import fs from 'node:fs';
import path from 'node:path';
import { ProjectHealthReport } from '../../shared/types/project-health';

export function formatMarkdownReport(report: ProjectHealthReport): string {
  const lines: string[] = [
    `# ${report.project.name} Code Health`,
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Project Health: ${report.summary.score}/100`,
    '',
    '## Score Breakdown',
    '',
    `- Architecture Score: ${report.summary.architectureScore}/100`,
    `- Complexity Score: ${report.summary.complexityScore}/100`,
    `- Maintainability Score: ${report.summary.maintainabilityScore}/100`,
    `- Coupling Score: ${report.summary.couplingScore}/100`,
    `- Testability Score: ${report.summary.testabilityScore}/100`,
    '',
    '## Critical Findings',
    '',
  ];

  const criticalFindings = report.architecture.violations.filter((violation) => violation.severity === 'error');
  if (criticalFindings.length === 0) {
    lines.push('- None');
  } else {
    lines.push(...criticalFindings.map((violation) => `- ${violation.file}: ${violation.message}`));
  }

  lines.push('', '## Top Refactor Priorities', '');
  if (report.hotspots.length === 0) {
    lines.push('- None');
  } else {
    lines.push(
      ...report.hotspots
        .slice(0, 10)
        .map((hotspot, index) => `${index + 1}. ${hotspot.file} - ${hotspot.priority} (${hotspot.refactorPriority}/100)`),
    );
  }

  lines.push('', '## Recommendations', '');
  if (report.recommendations.length === 0) {
    lines.push('- None');
  } else {
    lines.push(
      ...report.recommendations
        .slice(0, 20)
        .map((recommendation) => `- ${recommendation.file}: ${recommendation.reason} (${recommendation.priority})`),
    );
  }

  return `${lines.join('\n')}\n`;
}

export function writeMarkdownReport(report: ProjectHealthReport, outputDir: string): string {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, 'code-health-report.md');
  fs.writeFileSync(filePath, formatMarkdownReport(report));
  return filePath;
}
