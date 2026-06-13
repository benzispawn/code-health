import fs from "node:fs";
import path from "node:path";
import type { ProjectHealthReport } from "../../shared/types/project-health";
import { formatMarkdownReport } from "./markdown-reporter";

export function writeHtmlReport(
  report: ProjectHealthReport,
  outputDir: string,
): string {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, "code-health-report.html");
  const markdown = escapeHtml(formatMarkdownReport(report));
  fs.writeFileSync(
    filePath,
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(report.project.name)} Code Health</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; margin: 40px; max-width: 960px; }
    pre { white-space: pre-wrap; }
  </style>
</head>
<body><pre>${markdown}</pre></body>
</html>
`,
  );
  return filePath;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
