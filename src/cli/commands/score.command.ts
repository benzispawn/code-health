import { scanFromFlags } from './command-utils';

export async function scoreCommand(flags: Record<string, string | boolean>): Promise<void> {
  const report = await scanFromFlags(flags);
  console.log(`Project Health: ${report.summary.score}/100`);
  console.log(`Architecture Score: ${report.summary.architectureScore}/100`);
  console.log(`Complexity Score: ${report.summary.complexityScore}/100`);
  console.log(`Maintainability Score: ${report.summary.maintainabilityScore}/100`);
  console.log(`Coupling Score: ${report.summary.couplingScore}/100`);
  console.log(`Testability Score: ${report.summary.testabilityScore}/100`);
}
