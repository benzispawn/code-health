import fs from 'node:fs';
import type { CodeHealthConfig } from '../../shared/types/config';
import type {
  DomainAnalysis,
  ProjectHealthReport,
} from '../../shared/types/project-health';
import { relativePosix } from '../../shared/fs/path-utils';
import { validateArchitecture } from '../architecture/architecture-validator';
import { calculateDependencyDepths } from '../architecture/dependency-graph';
import { readGitChurn } from '../git/churn-reader';
import { calculateHotspots } from '../git/hotspot-calculator';
import { applyFanIn } from '../metrics/coupling/fan-in.metric';
import { readLcovCoverage } from '../metrics/coverage/lcov-reader';
import { calculateDuplicationMetrics } from '../metrics/maintainability/duplication.metric';
import {
  applyFileScores,
  calculateHealthSummary,
} from '../scoring/health-score-calculator';
import { createRefactorRecommendations } from '../scoring/refactor-priority-calculator';
import { findSourceFiles } from './file-scanner';
import { scanFileWithTsMorph } from './ts-morph-file-scanner';
import { createTsMorphProject } from './ts-morph-project';

export interface ScanProjectOptions {
  cwd: string;
  config: CodeHealthConfig;
  domain?: string;
  includeGit?: boolean;
}

export function scanProject(options: ScanProjectOptions): ProjectHealthReport {
  const sourceFiles = findSourceFiles(
    options.cwd,
    options.config,
    options.domain,
  );
  const project = createTsMorphProject(options.cwd, sourceFiles);
  const scannedFiles = sourceFiles.map((filePath) =>
    scanFileWithTsMorph(
      options.cwd,
      filePath,
      sourceFiles,
      options.config,
      project,
    ),
  );
  const sourceFilesByRelativePath = new Map(
    sourceFiles.map((filePath) => [
      relativePosix(options.cwd, filePath),
      filePath,
    ]),
  );
  const churn =
    options.includeGit === false
      ? new Map<string, number>()
      : readGitChurn(options.cwd);
  const coverage = readLcovCoverage(options.cwd);
  const duplication = calculateDuplicationMetrics(
    scannedFiles.map((file) => ({
      path: file.path,
      source: fs.readFileSync(
        sourceFilesByRelativePath.get(file.path) as string,
        'utf8',
      ),
    })),
  );
  const filesWithSignals = applyFanIn(scannedFiles).map((file) => {
    const coverageEntry = coverage.get(file.path);

    return {
      ...file,
      metrics: {
        ...file.metrics,
        churn: churn.get(file.path) ?? 0,
        duplicationPercent:
          duplication.fileDuplicationPercent.get(file.path) ?? 0,
        coverage: coverageEntry?.lineCoverage,
        lineCoverage: coverageEntry?.lineCoverage,
        branchCoverage: coverageEntry?.branchCoverage,
      },
    };
  });
  const initialArchitecture = validateArchitecture(
    filesWithSignals,
    options.config,
  );
  const dependencyDepths = calculateDependencyDepths(
    initialArchitecture.dependencyGraph,
  );
  const filesWithDepth = filesWithSignals.map((file) => ({
    ...file,
    metrics: {
      ...file.metrics,
      dependencyDepth: dependencyDepths.get(file.path) ?? 0,
    },
  }));
  const scoredFiles = applyFileScores(filesWithDepth, options.config);
  const architecture = validateArchitecture(scoredFiles, options.config);
  const hotspots = calculateHotspots(scoredFiles, architecture);
  const recommendations = createRefactorRecommendations(
    scoredFiles,
    architecture,
  );
  const summary = {
    ...calculateHealthSummary(scoredFiles, architecture, options.config),
    duplicationPercent: duplication.projectDuplicationPercent,
  };

  return {
    project: {
      name: options.config.project.name,
      framework: options.config.project.framework,
      sourceRoot: options.config.project.sourceRoot,
      architecture: options.config.project.architecture,
      root: options.cwd,
    },
    summary,
    files: scoredFiles,
    domains: calculateDomains(scoredFiles, architecture.violations),
    architecture,
    duplication: {
      percent: duplication.projectDuplicationPercent,
      groups: duplication.groups,
    },
    hotspots,
    recommendations,
    generatedAt: new Date().toISOString(),
    config: options.config,
  };
}

function calculateDomains(
  files: ProjectHealthReport['files'],
  violations: ProjectHealthReport['architecture']['violations'],
): DomainAnalysis[] {
  const domainNames = [
    ...new Set(
      files
        .map((file) => file.domain)
        .filter((domain): domain is string => Boolean(domain)),
    ),
  ];

  return domainNames.sort().map((name) => {
    const domainFiles = files.filter((file) => file.domain === name);
    return {
      name,
      fileCount: domainFiles.length,
      averageScore: Math.round(
        domainFiles.reduce((total, file) => total + file.score, 0) /
          domainFiles.length,
      ),
      architectureViolations: violations.filter((violation) => {
        const file = files.find(
          (candidate) => candidate.path === violation.file,
        );
        return file?.domain === name;
      }).length,
    };
  });
}
