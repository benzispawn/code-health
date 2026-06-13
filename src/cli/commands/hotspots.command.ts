import { scanFromFlags } from './command-utils';

export async function hotspotsCommand(flags: Record<string, string | boolean>): Promise<void> {
  const report = await scanFromFlags(flags);

  if (report.hotspots.length === 0) {
    console.log('No hotspots found');
    return;
  }

  for (const hotspot of report.hotspots.slice(0, 20)) {
    console.log(
      `${hotspot.priority.padEnd(9)} ${String(hotspot.refactorPriority).padStart(3)}/100 ${hotspot.file} ` +
        `(complexity ${hotspot.complexityScore}, churn ${hotspot.churnScore}, architecture ${hotspot.architectureRisk})`,
    );
  }
}
