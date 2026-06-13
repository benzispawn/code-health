import { runCli } from "../../dist/src/cli/main";

export async function runCliAndCapture(
  argv: string[],
  cwd?: string,
): Promise<string> {
  const originalLog = console.log;
  const originalError = console.error;
  const originalCwd = process.cwd();
  const lines: string[] = [];

  console.log = (message?: unknown, ...optionalParams: unknown[]): void => {
    lines.push([message, ...optionalParams].map(String).join(" "));
  };
  console.error = (message?: unknown, ...optionalParams: unknown[]): void => {
    lines.push([message, ...optionalParams].map(String).join(" "));
  };

  try {
    if (cwd) {
      process.chdir(cwd);
    }
    await runCli(argv);
  } finally {
    process.chdir(originalCwd);
    console.log = originalLog;
    console.error = originalError;
  }

  return `${lines.join("\n")}\n`;
}
