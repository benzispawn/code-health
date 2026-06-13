import type { CodeHealthConfig } from "./config";

export interface ProjectHealthReport {
  project: ProjectInfo;
  summary: HealthSummary;
  files: FileAnalysis[];
  domains: DomainAnalysis[];
  architecture: ArchitectureAnalysis;
  duplication: DuplicationAnalysis;
  hotspots: HotspotAnalysis[];
  recommendations: RefactorRecommendation[];
  generatedAt: string;
  config: CodeHealthConfig;
}

export interface ProjectInfo {
  name: string;
  framework: string;
  sourceRoot: string;
  architecture: string;
  root: string;
}

export interface HealthSummary {
  score: number;
  complexityScore: number;
  maintainabilityScore: number;
  couplingScore: number;
  architectureScore: number;
  testabilityScore: number;
  fileCount: number;
  functionCount: number;
  criticalFindingCount: number;
  duplicationPercent: number;
  maxDependencyDepth: number;
  averageLineCoverage?: number;
  averageBranchCoverage?: number;
  apiSurfaceSize: number;
  publicExportCount: number;
  controllerCount: number;
  endpointCount: number;
  packageCycleCount: number;
}

export interface FileAnalysis {
  path: string;
  domain?: string;
  layer?: string;
  loc: number;
  functions: FunctionAnalysis[];
  classes: ClassAnalysis[];
  imports: ImportAnalysis[];
  metrics: FileMetrics;
  score: number;
}

export interface FunctionAnalysis {
  name: string;
  lineStart: number;
  lineEnd: number;
  loc: number;
  decorators: string[];
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  npathComplexity?: number;
  parameterCount: number;
}

export interface ClassAnalysis {
  name: string;
  decorators: string[];
  lineStart: number;
  lineEnd: number;
  loc: number;
  methods: string[];
  methodCount: number;
}

export interface ImportAnalysis {
  source: string;
  resolvedPath?: string;
  isRelative: boolean;
}

export interface FileMetrics {
  maintainabilityIndex: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  npathComplexity: number;
  physicalLoc: number;
  logicalLoc: number;
  commentLines: number;
  commentRatio: number;
  duplicationPercent: number;
  dependencyDepth: number;
  publicExportCount: number;
  controllerCount: number;
  endpointCount: number;
  fanIn: number;
  fanOut: number;
  churn?: number;
  coverage?: number;
  lineCoverage?: number;
  branchCoverage?: number;
}

export interface DomainAnalysis {
  name: string;
  fileCount: number;
  averageScore: number;
  architectureViolations: number;
}

export interface ArchitectureAnalysis {
  score: number;
  violations: ArchitectureViolation[];
  circularDependencies: CircularDependency[];
  packageCycles: CircularDependency[];
  dependencyGraph: DependencyGraph;
}

export interface ArchitectureViolation {
  file: string;
  importedFile?: string;
  rule: string;
  message: string;
  severity: "warning" | "error";
}

export interface CircularDependency {
  files: string[];
}

export interface DependencyGraph {
  nodes: string[];
  edges: DependencyEdge[];
}

export interface DependencyEdge {
  from: string;
  to: string;
}

export interface DuplicationAnalysis {
  percent: number;
  groups: DuplicationGroupAnalysis[];
}

export interface DuplicationGroupAnalysis {
  fingerprint: string;
  normalizedText: string;
  occurrences: DuplicationOccurrenceAnalysis[];
  lineCount: number;
  severity: "Low" | "Medium" | "High";
}

export interface DuplicationOccurrenceAnalysis {
  file: string;
  lineStart: number;
  lineEnd: number;
}

export interface HotspotAnalysis {
  file: string;
  complexityScore: number;
  churnScore: number;
  architectureRisk: number;
  refactorPriority: number;
  priority: "Low" | "Medium" | "High" | "Very High";
}

export interface RefactorRecommendation {
  file: string;
  type:
    | "extract-method"
    | "split-service"
    | "fix-architecture"
    | "add-tests"
    | "reduce-coupling";
  priority: "Low" | "Medium" | "High" | "Very High";
  reason: string;
}
