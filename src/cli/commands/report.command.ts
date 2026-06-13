import path from 'node:path';
import { writeHtmlReport } from '../../core/reporting/html-reporter';
import { writeJsonReport } from '../../core/reporting/json-reporter';
import { writeMarkdownReport } from '../../core/reporting/markdown-reporter';
import { scanFromFlags } from './command-utils';

export async function reportCommand(
  flags: Record<string, string | boolean>,
): Promise<void> {
  const report = await scanFromFlags(flags);
  const outputDir = path.resolve(
    report.project.root,
    report.config.reports.outputDir,
  );
  const requestedFormat =
    typeof flags.format === 'string' ? flags.format : undefined;
  const formats = requestedFormat
    ? [requestedFormat]
    : report.config.reports.formats;
  const written: string[] = [];

  for (const format of formats) {
    if (format === 'json') {
      written.push(writeJsonReport(report, outputDir));
    } else if (format === 'markdown') {
      written.push(writeMarkdownReport(report, outputDir));
    } else if (format === 'html') {
      written.push(writeHtmlReport(report, outputDir));
    } else {
      throw new Error(`Unsupported report format: ${format}`);
    }
  }

  for (const file of written) {
    console.log(`created ${path.relative(report.project.root, file)}`);
  }
}
