import { compareSpecCommand } from "./commands/compare-spec.command";
import { duplicationCommand } from "./commands/duplication.command";
import { hotspotsCommand } from "./commands/hotspots.command";
import { initCommand } from "./commands/init.command";
import { reportCommand } from "./commands/report.command";
import { scanCommand } from "./commands/scan.command";
import { scoreCommand } from "./commands/score.command";
import { suggestRefactorCommand } from "./commands/suggest-refactor.command";
import { validateArchitectureCommand } from "./commands/validate-architecture.command";

export interface ParsedArgs {
  command?: string;
  flags: Record<string, string | boolean>;
}

export async function runCli(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  if (!args.command || args.flags.help === true || args.command === "help") {
    printHelp();
    return;
  }

  if (args.command === "init") {
    initCommand(args.flags);
    return;
  }
  if (args.command === "scan") {
    await scanCommand(args.flags);
    return;
  }
  if (args.command === "score") {
    await scoreCommand(args.flags);
    return;
  }
  if (args.command === "duplication") {
    await duplicationCommand(args.flags);
    return;
  }
  if (args.command === "report") {
    await reportCommand(args.flags);
    return;
  }
  if (args.command === "validate-architecture") {
    await validateArchitectureCommand(args.flags);
    return;
  }
  if (args.command === "hotspots") {
    await hotspotsCommand(args.flags);
    return;
  }
  if (args.command === "compare-spec") {
    await compareSpecCommand(args.flags);
    return;
  }
  if (args.command === "suggest-refactor") {
    await suggestRefactorCommand(args.flags);
    return;
  }

  throw new Error(`Unknown command: ${args.command}`);
}

export function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  if (command?.startsWith("--")) {
    return { flags: parseFlags(argv) };
  }
  return { command, flags: parseFlags(rest) };
}

function parseFlags(args: string[]): Record<string, string | boolean> {
  const flags: Record<string, string | boolean> = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      continue;
    }
    const [rawKey, inlineValue] = arg.slice(2).split("=", 2);
    if (inlineValue !== undefined) {
      flags[rawKey] = inlineValue;
      continue;
    }
    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      flags[rawKey] = next;
      index += 1;
    } else {
      flags[rawKey] = true;
    }
  }
  return flags;
}

function printHelp(): void {
  console.log(`code-health

Usage:
  code-health init
  code-health scan [--domain billing] [--duplication] [--config code-health.config.ts]
  code-health score
  code-health duplication [--show-code] [--limit 10] [--json]
  code-health report [--format json|markdown|html]
  code-health validate-architecture
  code-health hotspots
  code-health compare-spec
  code-health suggest-refactor

Commands:
  init                  Creates code-health.config.ts
  scan                  Scans source code and extracts metrics
  score                 Calculates the project health score
  duplication           Shows duplicated code blocks and locations
  report                Generates JSON, Markdown, or HTML reports
  validate-architecture Checks layer and domain rules
  hotspots              Combines complexity and git churn
  compare-spec          Compares codebase against domain.spec.yaml
  suggest-refactor      Prints refactor recommendations
`);
}
