import type { CodeHealthConfig } from '../shared/types/config';

export const DEFAULT_CONFIG: CodeHealthConfig = {
  project: {
    name: 'nestjs-project',
    framework: 'nestjs',
    sourceRoot: 'src',
    architecture: 'layered',
  },
  spec: {
    enabled: true,
    file: './domain.spec.yaml',
  },
  scan: {
    include: ['src/**/*.ts'],
    exclude: [
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.module.ts',
      '**/node_modules/**',
      '**/dist/**',
    ],
  },
  architecture: {
    layers: {
      controller: ['*.controller.ts'],
      service: ['*.service.ts'],
      repository: ['*.repository.ts', '*/repositories/*.ts'],
      dto: ['*.dto.ts'],
      entity: ['*.entity.ts'],
      guard: ['*.guard.ts'],
      interceptor: ['*.interceptor.ts'],
      decorator: ['*.decorator.ts'],
      pipe: ['*.pipe.ts'],
      domain: ['*/domain/**/*.ts'],
      infrastructure: ['*/infrastructure/**/*.ts'],
    },
    rules: [
      {
        from: 'controller',
        disallow: ['repository'],
      },
      {
        from: 'domain',
        disallow: ['infrastructure'],
      },
    ],
  },
  thresholds: {
    cyclomaticComplexity: 10,
    cognitiveComplexity: 15,
    fileLength: 300,
    functionLength: 50,
    duplicationPercent: 5,
    fanOut: 12,
    maintainabilityIndex: 65,
  },
  scoring: {
    complexityWeight: 0.25,
    maintainabilityWeight: 0.2,
    couplingWeight: 0.2,
    architectureWeight: 0.2,
    testabilityWeight: 0.15,
  },
  reports: {
    outputDir: './reports/code-health',
    formats: ['json', 'markdown'],
  },
};
