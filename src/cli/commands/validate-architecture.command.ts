import { scanFromFlags } from './command-utils';

export async function validateArchitectureCommand(
  flags: Record<string, string | boolean>,
): Promise<void> {
  const report = await scanFromFlags(flags);

  if (report.architecture.violations.length === 0) {
    console.log('Architecture valid');
    return;
  }

  for (const violation of report.architecture.violations) {
    console.log(
      `${violation.severity}: ${violation.file}: ${violation.message}`,
    );
  }

  if (flags.fail === true) {
    process.exitCode = 1;
  }
}
