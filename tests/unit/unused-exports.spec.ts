import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createTsMorphProject } from '../../src/core/scanner/ts-morph-project';
import { analyzeUnusedExports } from '../../src/core/dead-code/unused-exports';

describe('analyzeUnusedExports', () => {
  it('reports only conservative unused internal named exports', () => {
    const cwd = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/unused-exports',
    );
    const sourceFiles = [
      path.join(cwd, 'src/consumer.ts'),
      path.join(cwd, 'src/services/used.service.ts'),
      path.join(cwd, 'src/services/unused.service.ts'),
      path.join(cwd, 'src/controllers/app.controller.ts'),
      path.join(cwd, 'src/barrel/index.ts'),
    ];
    const project = createTsMorphProject(cwd, sourceFiles);

    const result = analyzeUnusedExports(project, sourceFiles, cwd);

    expect(result).toEqual([
      {
        file: 'src/services/unused.service.ts',
        exportName: 'UnusedService',
        kind: 'class',
        reason: 'Named export has no internal named-import consumers',
      },
    ]);
  });
});
