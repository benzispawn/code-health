import path from "node:path";
import { loadConfig } from "../../config/config-loader";
import { scanProject } from "../../core/scanner/project-scanner";
import type { ProjectHealthReport } from "../../shared/types/project-health";

export async function scanFromFlags(
  flags: Record<string, string | boolean>,
): Promise<ProjectHealthReport> {
  const cwd =
    typeof flags.cwd === "string" ? path.resolve(flags.cwd) : process.cwd();
  const config = await loadConfig({
    cwd,
    configPath: typeof flags.config === "string" ? flags.config : undefined,
  });

  return scanProject({
    cwd,
    config,
    domain: typeof flags.domain === "string" ? flags.domain : undefined,
    includeGit: flags.git !== false,
  });
}

export function printLines(lines: string[]): void {
  for (const line of lines) {
    console.log(line);
  }
}
