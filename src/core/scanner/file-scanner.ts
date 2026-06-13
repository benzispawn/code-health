import fs from "node:fs";
import path from "node:path";
import type { CodeHealthConfig } from "../../shared/types/config";
import { relativePosix, toPosixPath } from "../../shared/fs/path-utils";

export function findSourceFiles(
  cwd: string,
  config: CodeHealthConfig,
  domain?: string,
): string[] {
  const sourceRoot = path.resolve(cwd, config.project.sourceRoot);
  if (!fs.existsSync(sourceRoot)) {
    return [];
  }

  const files = walk(sourceRoot)
    .filter((filePath) => filePath.endsWith(".ts") || filePath.endsWith(".tsx"))
    .filter((filePath) => isIncluded(cwd, filePath, config))
    .filter((filePath) => {
      if (!domain) {
        return true;
      }
      const relative = relativePosix(cwd, filePath);
      return (
        relative.includes(`/${domain}/`) || relative.endsWith(`/${domain}.ts`)
      );
    })
    .sort();

  return files;
}

function walk(directory: string): string[] {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === "dist" ||
        entry.name === ".git"
      ) {
        continue;
      }
      files.push(...walk(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function isIncluded(
  cwd: string,
  filePath: string,
  config: CodeHealthConfig,
): boolean {
  const relative = relativePosix(cwd, filePath);
  const included = config.scan.include.some((pattern) =>
    matchesPattern(relative, pattern),
  );
  const excluded = config.scan.exclude.some((pattern) =>
    matchesPattern(relative, pattern),
  );
  return included && !excluded;
}

export function matchesPattern(filePath: string, pattern: string): boolean {
  const normalizedFile = toPosixPath(filePath);
  const normalizedPattern = toPosixPath(pattern);

  if (normalizedPattern.includes("/**/")) {
    const directPattern = normalizedPattern.replace("/**/", "/");
    if (matchesPattern(normalizedFile, directPattern)) {
      return true;
    }
  }

  if (normalizedPattern.startsWith("*/")) {
    return globToRegExp(`**/${normalizedPattern}`).test(normalizedFile);
  }

  if (normalizedPattern.startsWith("**/")) {
    const suffixPattern = normalizedPattern.slice(3);
    return (
      matchesPattern(normalizedFile, suffixPattern) ||
      globToRegExp(normalizedPattern).test(normalizedFile)
    );
  }

  if (normalizedPattern.endsWith("/**")) {
    return normalizedFile.startsWith(normalizedPattern.slice(0, -3));
  }

  const regex = globToRegExp(normalizedPattern);
  return regex.test(normalizedFile);
}

function globToRegExp(pattern: string): RegExp {
  let source = "^";
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const next = pattern[index + 1];

    if (char === "*" && next === "*") {
      source += ".*";
      index += 1;
      continue;
    }
    if (char === "*") {
      source += "[^/]*";
      continue;
    }
    if (char === "?") {
      source += ".";
      continue;
    }
    source += escapeRegExp(char);
  }
  source += "$";
  return new RegExp(source);
}

function escapeRegExp(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}
