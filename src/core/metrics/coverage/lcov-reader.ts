import fs from "node:fs";
import path from "node:path";
import { relativePosix } from "../../../shared/fs/path-utils";

export interface CoverageEntry {
  lineCoverage?: number;
  branchCoverage?: number;
}

export function readLcovCoverage(
  cwd: string,
  lcovPath = "coverage/lcov.info",
): Map<string, CoverageEntry> {
  const resolved = path.resolve(cwd, lcovPath);
  if (!fs.existsSync(resolved)) {
    return new Map();
  }

  const coverage = new Map<string, CoverageEntry>();
  const records = fs.readFileSync(resolved, "utf8").split("end_of_record");

  for (const record of records) {
    const lines = record
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const sourceFileLine = lines.find((line) => line.startsWith("SF:"));
    if (!sourceFileLine) {
      continue;
    }

    const sourceFile = normalizeCoveragePath(cwd, sourceFileLine.slice(3));
    const foundLines = numberValue(lines, "LF:");
    const hitLines = numberValue(lines, "LH:");
    const foundBranches = numberValue(lines, "BRF:");
    const hitBranches = numberValue(lines, "BRH:");

    coverage.set(sourceFile, {
      lineCoverage:
        foundLines === undefined || foundLines === 0 || hitLines === undefined
          ? undefined
          : Math.round((hitLines / foundLines) * 100),
      branchCoverage:
        foundBranches === undefined ||
        foundBranches === 0 ||
        hitBranches === undefined
          ? undefined
          : Math.round((hitBranches / foundBranches) * 100),
    });
  }

  return coverage;
}

function numberValue(lines: string[], prefix: string): number | undefined {
  const line = lines.find((item) => item.startsWith(prefix));
  if (!line) {
    return undefined;
  }
  const value = Number(line.slice(prefix.length));
  return Number.isFinite(value) ? value : undefined;
}

function normalizeCoveragePath(cwd: string, filePath: string): string {
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(cwd, filePath);
  return relativePosix(cwd, absolute);
}
