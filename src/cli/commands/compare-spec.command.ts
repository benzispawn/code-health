import { loadSpecText } from '../../core/spec/spec-loader';
import { compareSpecToReport } from '../../core/spec/spec-comparator';
import { scanFromFlags } from './command-utils';

export async function compareSpecCommand(flags: Record<string, string | boolean>): Promise<void> {
  const report = await scanFromFlags(flags);
  const specFile = typeof flags.spec === 'string' ? flags.spec : report.config.spec.file;
  const specText = loadSpecText(report.project.root, specFile);

  if (!specText) {
    console.log(`Spec not found: ${specFile}`);
    if (flags.fail === true) {
      process.exitCode = 1;
    }
    return;
  }

  const comparison = compareSpecToReport(specText, report);
  console.log(`Spec checks: ${comparison.checked}`);

  if (comparison.missing.length === 0) {
    console.log('Spec compliance: OK');
    return;
  }

  console.log('Missing implementation:');
  for (const missing of comparison.missing) {
    console.log(`- ${missing}`);
  }

  if (flags.fail === true) {
    process.exitCode = 1;
  }
}
