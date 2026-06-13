import { formatTerminalSummary } from '../../core/reporting/terminal-reporter';
import { formatDuplicationReport } from '../../core/reporting/duplication-reporter';
import { scanFromFlags, printLines } from './command-utils';

export async function scanCommand(flags: Record<string, string | boolean>): Promise<void> {
  const report = await scanFromFlags(flags);

  if (flags.json === true) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  printLines(formatTerminalSummary(report));
  if (flags.duplication === true) {
    console.log('');
    printLines(formatDuplicationReport(report, { showCode: flags['show-code'] === true }));
  }
}
