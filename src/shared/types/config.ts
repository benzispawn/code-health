export type ProjectFramework = "nestjs" | "typescript";
export type ArchitectureStyle =
  | "layered"
  | "clean-architecture"
  | "hexagonal"
  | "modular-monolith";
export type ReportFormat = "json" | "markdown" | "html";

export interface CodeHealthConfig {
  project: {
    name: string;
    framework: ProjectFramework;
    sourceRoot: string;
    architecture: ArchitectureStyle;
  };
  spec: {
    enabled: boolean;
    file: string;
  };
  scan: {
    include: string[];
    exclude: string[];
  };
  architecture: {
    layers: Record<string, string[]>;
    rules: ArchitectureRule[];
  };
  thresholds: HealthThresholds;
  scoring: ScoreWeights;
  reports: {
    outputDir: string;
    formats: ReportFormat[];
  };
}

export interface ArchitectureRule {
  from: string;
  disallow: string[];
}

export interface HealthThresholds {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  fileLength: number;
  functionLength: number;
  duplicationPercent: number;
  fanOut: number;
  maintainabilityIndex: number;
}

export interface ScoreWeights {
  complexityWeight: number;
  maintainabilityWeight: number;
  couplingWeight: number;
  architectureWeight: number;
  testabilityWeight: number;
}

export function defineConfig(config: CodeHealthConfig): CodeHealthConfig {
  return config;
}
