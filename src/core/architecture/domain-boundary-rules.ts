import type { CodeHealthConfig } from "../../shared/types/config";

export function detectDomain(
  relativePath: string,
  config: CodeHealthConfig,
): string | undefined {
  const sourceRoot = config.project.sourceRoot.replace(/\/$/, "");
  const parts = relativePath.split("/");
  const sourceIndex = parts.indexOf(sourceRoot);

  if (sourceIndex === -1 || parts.length <= sourceIndex + 1) {
    return undefined;
  }

  const domain = parts[sourceIndex + 1];
  if (!domain || domain.includes(".")) {
    return undefined;
  }

  return domain;
}
