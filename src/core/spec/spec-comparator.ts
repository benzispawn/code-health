import { ProjectHealthReport } from '../../shared/types/project-health';
import { extractSpecExpectations } from './spec-validator';

export interface SpecComparisonResult {
  checked: number;
  missing: string[];
}

export function compareSpecToReport(specText: string, report: ProjectHealthReport): SpecComparisonResult {
  const expectations = extractSpecExpectations(specText);
  const classNames = new Set(report.files.flatMap((file) => file.classes.map((item) => item.name)));
  const methodNames = new Set([
    ...report.files.flatMap((file) => file.functions.map((item) => item.name)),
    ...report.files.flatMap((file) => file.classes.flatMap((item) => item.methods)),
  ]);
  const missing: string[] = [];

  for (const expectation of expectations) {
    const exists = expectation.kind === 'method' ? methodNames.has(expectation.name) : classNames.has(expectation.name) || methodNames.has(expectation.name);
    if (!exists) {
      missing.push(`${expectation.kind}: ${expectation.name}`);
    }
  }

  return {
    checked: expectations.length,
    missing,
  };
}
