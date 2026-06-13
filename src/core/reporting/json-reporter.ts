import fs from "node:fs";
import path from "node:path";
import type { ProjectHealthReport } from "../../shared/types/project-health";

export function writeJsonReport(
  report: ProjectHealthReport,
  outputDir: string,
): string {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, "code-health-report.json");
  fs.writeFileSync(filePath, `${JSON.stringify(report, null, 2)}\n`);
  return filePath;
}
