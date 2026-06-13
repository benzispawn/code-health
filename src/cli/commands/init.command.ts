import fs from 'node:fs';
import path from 'node:path';

export function initCommand(flags: Record<string, string | boolean>): void {
  const fileName =
    typeof flags.config === 'string' ? flags.config : 'code-health.config.ts';
  const target = path.resolve(process.cwd(), fileName);

  if (fs.existsSync(target) && flags.force !== true) {
    console.log(
      `skipped ${path.relative(process.cwd(), target)} (use --force to overwrite)`,
    );
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, configTemplate());
  console.log(`created ${path.relative(process.cwd(), target)}`);
}

function configTemplate(): string {
  return `import { defineConfig } from '@rbenzi/code-health';

export default defineConfig({
  project: {
    name: 'email-saas',
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
});
`;
}
