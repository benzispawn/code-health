import { ProjectHealthReport } from '../../shared/types/project-health';
import { formatRating, rateDuplication } from './rating';

export interface DuplicationFormatOptions {
  limit?: number;
  showCode?: boolean;
}

export function formatDuplicationReport(
  report: ProjectHealthReport,
  options: DuplicationFormatOptions = {},
): string[] {
  const limit = options.limit ?? 10;
  const lines = [
    `Duplication: ${report.duplication.percent}% ${formatRating(rateDuplication(report.duplication.percent))}`,
    '',
    'Top Duplicate Blocks:',
  ];

  if (report.duplication.groups.length === 0) {
    lines.push('- None');
    return lines;
  }

  for (const [index, group] of report.duplication.groups.slice(0, limit).entries()) {
    lines.push(
      '',
      `${index + 1}. ${group.lineCount} lines repeated in ${group.occurrences.length} locations (${group.severity})`,
    );
    for (const occurrence of group.occurrences) {
      lines.push(`   - ${occurrence.file}:${occurrence.lineStart}-${occurrence.lineEnd}`);
    }
    if (options.showCode) {
      lines.push('', '   Block:', ...group.normalizedText.split('\n').map((line) => `   ${line}`));
    }
  }

  return lines;
}
