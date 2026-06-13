import { formatDuplicationReport } from '../../core/reporting/duplication-reporter';
import { printLines, scanFromFlags } from './command-utils';

export async function duplicationCommand(flags: Record<string, string | boolean>): Promise<void> {
  const report = await scanFromFlags(flags);
  const limit = typeof flags.limit === 'string' ? Number(flags.limit) : undefined;

  if (flags.json === true) {
    console.log(JSON.stringify(report.duplication, null, 2));
    return;
  }

  printLines(formatDuplicationReport(report, {
    limit: Number.isFinite(limit) ? limit : undefined,
    showCode: flags['show-code'] === true,
  }));
}
