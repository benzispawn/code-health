import type { CodeHealthConfig } from "../shared/types/config";

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateConfig(
  config: CodeHealthConfig,
): ConfigValidationResult {
  const errors: string[] = [];

  if (!config.project.name) {
    errors.push("project.name is required");
  }
  if (!config.project.sourceRoot) {
    errors.push("project.sourceRoot is required");
  }
  if (config.scan.include.length === 0) {
    errors.push("scan.include must contain at least one pattern");
  }
  if (config.reports.formats.length === 0) {
    errors.push("reports.formats must contain at least one format");
  }

  const weightTotal =
    config.scoring.complexityWeight +
    config.scoring.maintainabilityWeight +
    config.scoring.couplingWeight +
    config.scoring.architectureWeight +
    config.scoring.testabilityWeight;

  if (Math.abs(weightTotal - 1) > 0.001) {
    errors.push(
      `scoring weights must add up to 1. Current total: ${weightTotal}`,
    );
  }

  return { valid: errors.length === 0, errors };
}
