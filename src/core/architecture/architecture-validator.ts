import type { CodeHealthConfig } from '../../shared/types/config';
import type {
  ArchitectureAnalysis,
  ArchitectureViolation,
  FileAnalysis,
} from '../../shared/types/project-health';
import {
  buildDependencyGraph,
  buildPackageDependencyGraph,
  findCircularDependencies,
} from './dependency-graph';

export function validateArchitecture(
  files: FileAnalysis[],
  config: CodeHealthConfig,
): ArchitectureAnalysis {
  const violations: ArchitectureViolation[] = [];
  const filesByPath = new Map(files.map((file) => [file.path, file]));

  for (const file of files) {
    for (const imported of file.imports) {
      if (!imported.resolvedPath) {
        continue;
      }

      const target = filesByPath.get(imported.resolvedPath);
      if (!target) {
        continue;
      }

      violations.push(...validateLayerRules(file, target, config));
      const boundaryViolation = validateDomainBoundary(file, target);
      if (boundaryViolation) {
        violations.push(boundaryViolation);
      }
    }
  }

  const dependencyGraph = buildDependencyGraph(files);
  const circularDependencies = findCircularDependencies(dependencyGraph);
  const packageCycles = findCircularDependencies(
    buildPackageDependencyGraph(dependencyGraph),
  );

  for (const cycle of circularDependencies) {
    violations.push({
      file: cycle.files[0],
      rule: 'circular-dependency',
      message: `Circular dependency detected: ${cycle.files.join(' -> ')}`,
      severity: 'error',
    });
  }

  for (const cycle of packageCycles) {
    violations.push({
      file: cycle.files[0],
      rule: 'package-cycle',
      message: `Package cycle detected: ${cycle.files.join(' -> ')}`,
      severity: 'warning',
    });
  }

  const penalty = violations.reduce(
    (total, violation) => total + (violation.severity === 'error' ? 12 : 5),
    0,
  );

  return {
    score: Math.max(0, 100 - penalty),
    violations,
    circularDependencies,
    packageCycles,
    dependencyGraph,
  };
}

function validateLayerRules(
  file: FileAnalysis,
  target: FileAnalysis,
  config: CodeHealthConfig,
): ArchitectureViolation[] {
  if (!file.layer || !target.layer) {
    return [];
  }

  return config.architecture.rules
    .filter(
      (rule) =>
        rule.from === file.layer &&
        rule.disallow.includes(target.layer as string),
    )
    .map((rule) => ({
      file: file.path,
      importedFile: target.path,
      rule: `${rule.from}-must-not-import-${target.layer}`,
      message: `${file.layer} file imports disallowed ${target.layer} file`,
      severity: 'error' as const,
    }));
}

function validateDomainBoundary(
  file: FileAnalysis,
  target: FileAnalysis,
): ArchitectureViolation | undefined {
  if (!file.domain || !target.domain || file.domain === target.domain) {
    return undefined;
  }

  if (target.path.includes('/internal/')) {
    return {
      file: file.path,
      importedFile: target.path,
      rule: 'cross-domain-internal-import',
      message: `${file.domain} imports ${target.domain} internal code`,
      severity: 'error',
    };
  }

  return undefined;
}
