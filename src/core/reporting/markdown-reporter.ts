import fs from 'node:fs';
import path from 'node:path';
import type { ProjectHealthReport } from '../../shared/types/project-health';

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
    `- Duplication: ${report.summary.duplicationPercent}%`,
    `- Max Dependency Depth: ${report.summary.maxDependencyDepth}`,
    `- API Surface Size: ${report.summary.apiSurfaceSize}`,
    `- Public Exports: ${report.summary.publicExportCount}`,
    `- Controllers: ${report.summary.controllerCount}`,
    `- Endpoints: ${report.summary.endpointCount}`,
    `- Package Cycles: ${report.summary.packageCycleCount}`,
    ...(report.summary.averageLineCoverage === undefined
      ? []
      : [`- Line Coverage: ${report.summary.averageLineCoverage}%`]),
    ...(report.summary.averageBranchCoverage === undefined
      ? []
      : [`- Branch Coverage: ${report.summary.averageBranchCoverage}%`]),
    ...(report.summary.maxCrapScore === undefined
      ? []
      : [`- Max CRAP: ${report.summary.maxCrapScore}`]),
    '',
    '## Critical Findings',
    '',
  ];

  const criticalFindings = report.architecture.violations.filter(
    (violation) => violation.severity === 'error',
  );
  if (criticalFindings.length === 0) {
    lines.push('- None');
  } else {
    lines.push(
      ...criticalFindings.map(
        (violation) => `- ${violation.file}: ${violation.message}`,
      ),
    );
  }

  lines.push('', '## Top Refactor Priorities', '');
  if (report.hotspots.length === 0) {
    lines.push('- None');
  } else {
    lines.push(
      ...report.hotspots
        .slice(0, 10)
        .map(
          (hotspot, index) =>
            `${index + 1}. ${hotspot.file} - ${hotspot.priority} (${hotspot.refactorPriority}/100, CRAP ${hotspot.crapScore})`,
        ),
    );
  }

  lines.push(
    '',
    '## Duplication',
    '',
    `Project Duplication: ${report.duplication.percent}%`,
    '',
  );
  if (report.duplication.groups.length === 0) {
    lines.push('- None');
  } else {
    lines.push('| Lines | Severity | Occurrences |');
    lines.push('| ---: | --- | --- |');
    lines.push(
      ...report.duplication.groups.slice(0, 20).map((group) => {
        const occurrences = group.occurrences
          .map(
            (occurrence) =>
              `${occurrence.file}:${occurrence.lineStart}-${occurrence.lineEnd}`,
          )
          .join('<br>');
        return `| ${group.lineCount} | ${group.severity} | ${occurrences} |`;
      }),
    );
  }

  lines.push('', '## Change Coupling', '');
  if (report.changeCoupling.pairs.length === 0) {
    lines.push('- None');
  } else {
    lines.push('| Files | Shared Commits | Coupling |');
    lines.push('| --- | ---: | ---: |');
    lines.push(
      ...report.changeCoupling.pairs.slice(0, 20).map((pair) => {
        const files = `${pair.files[0]} <-> ${pair.files[1]}`;
        return `| ${files} | ${pair.sharedCommits} | ${pair.couplingPercent}% |`;
      }),
    );
  }

  lines.push('', '## Package Stability', '');
  if (report.packageStability.length === 0) {
    lines.push('- None');
  } else {
    lines.push('| Package | Ca | Ce | Instability |');
    lines.push('| --- | ---: | ---: | ---: |');
    lines.push(
      ...report.packageStability.map((pkg) => {
        return `| ${pkg.packagePath} | ${pkg.afferentCoupling} | ${pkg.efferentCoupling} | ${pkg.instability} |`;
      }),
    );
  }

  lines.push('', '## Unused Export Candidates', '');
  if (report.unusedExports.length === 0) {
    lines.push('- None');
  } else {
    lines.push('| File | Export | Kind | Reason |');
    lines.push('| --- | --- | --- | --- |');
    lines.push(
      ...report.unusedExports.map((candidate) => {
        return `| ${candidate.file} | ${candidate.exportName} | ${candidate.kind} | ${candidate.reason} |`;
      }),
    );
  }

  lines.push('', '## File Metrics', '');
  if (report.files.length === 0) {
    lines.push('- None');
  } else {
    lines.push(
      '| File | Score | LOC | Logical LOC | Comments | Duplication | Fan-in | Fan-out | Depth | Exports | Endpoints | Coverage | CRAP | Coupled Peers |',
    );
    lines.push(
      '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
    );
    lines.push(
      ...report.files.slice(0, 30).map((file) => {
        const coverage =
          file.metrics.lineCoverage === undefined
            ? '-'
            : `${file.metrics.lineCoverage}%`;
        const crapScore =
          file.metrics.crapScore === undefined ? '-' : file.metrics.crapScore;
        const coupledPeers =
          file.changeCoupling.length === 0
            ? '-'
            : file.changeCoupling
                .map(
                  (peer) =>
                    `${peer.file} (${peer.sharedCommits}, ${peer.couplingPercent}%)`,
                )
                .join('<br>');
        return `| ${file.path} | ${file.score} | ${file.metrics.physicalLoc} | ${file.metrics.logicalLoc} | ${file.metrics.commentRatio}% | ${file.metrics.duplicationPercent}% | ${file.metrics.fanIn} | ${file.metrics.fanOut} | ${file.metrics.dependencyDepth} | ${file.metrics.publicExportCount} | ${file.metrics.endpointCount} | ${coverage} | ${crapScore} | ${coupledPeers} |`;
      }),
    );
  }

  lines.push('', '## Recommendations', '');
  if (report.recommendations.length === 0) {
    lines.push('- None');
  } else {
    lines.push(
      ...report.recommendations
        .slice(0, 20)
        .map(
          (recommendation) =>
            `- ${recommendation.file}: ${recommendation.reason} (${recommendation.priority})`,
        ),
    );
  }

  return `${lines.join('\n')}\n`;
}

export function writeMarkdownReport(
  report: ProjectHealthReport,
  outputDir: string,
): string {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, 'code-health-report.md');
  fs.writeFileSync(filePath, formatMarkdownReport(report));
  return filePath;
}
