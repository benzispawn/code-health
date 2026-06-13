import type { ImportAnalysis } from "../../../shared/types/project-health";

export function calculateFanOut(imports: ImportAnalysis[]): number {
  return imports.length;
}
