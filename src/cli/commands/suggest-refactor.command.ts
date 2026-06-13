import { scanFromFlags } from './command-utils';

export async function suggestRefactorCommand(
  flags: Record<string, string | boolean>,
): Promise<void> {
  const report = await scanFromFlags(flags);

  if (report.recommendations.length === 0) {
    console.log('No refactor recommendations found');
    return;
  }

  for (const recommendation of report.recommendations.slice(0, 30)) {
    console.log(
      `${recommendation.priority.padEnd(9)} ${recommendation.file}: ${recommendation.reason}`,
    );
  }
}
