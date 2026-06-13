import type { FileAnalysis } from "../../../shared/types/project-health";

export function applyFanIn(files: FileAnalysis[]): FileAnalysis[] {
  const fanIn = new Map<string, number>();

  for (const file of files) {
    for (const imported of file.imports) {
      if (!imported.resolvedPath) {
        continue;
      }
      fanIn.set(
        imported.resolvedPath,
        (fanIn.get(imported.resolvedPath) ?? 0) + 1,
      );
    }
  }

  return files.map((file) => ({
    ...file,
    metrics: {
      ...file.metrics,
      fanIn: fanIn.get(file.path) ?? 0,
    },
  }));
}
