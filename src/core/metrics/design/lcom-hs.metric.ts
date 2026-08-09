import type { ClassCohesionAnalysis } from '../../../shared/types/project-health';

export interface LcomHsInput {
  fieldNames: string[];
  methodFieldUsage: Set<string>[];
}

export function calculateLcomHs(input: LcomHsInput): ClassCohesionAnalysis {
  const fieldCount = input.fieldNames.length;
  const methodCount = input.methodFieldUsage.length;
  const methodFieldIntersections = input.methodFieldUsage.reduce(
    (total, usage) => total + usage.size,
    0,
  );

  if (fieldCount <= 1 || methodCount <= 1) {
    return {
      fieldCount,
      methodCount,
      methodFieldIntersections,
      lcomHs: undefined,
    };
  }

  const lcomHs =
    (methodCount - methodFieldIntersections / fieldCount) / (methodCount - 1);

  return {
    fieldCount,
    methodCount,
    methodFieldIntersections,
    lcomHs: Number(lcomHs.toFixed(2)),
  };
}
