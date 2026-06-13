import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../../src/config/default-config';
import { loadSpecText } from '../../src/core/spec/spec-loader';
import { compareSpecToReport } from '../../src/core/spec/spec-comparator';
import { scanProject } from '../../src/core/scanner/project-scanner';

describe('compareSpecToReport', () => {
  it('matches decorator exports declared in the spec', () => {
    const cwd = path.resolve(process.cwd(), 'tests/fixtures/projects/clean-valid');
    const report = scanProject({ cwd, config: DEFAULT_CONFIG, includeGit: false });
    const specText = loadSpecText(cwd, './domain.spec.yaml');

    expect(specText).toBeDefined();
    const comparison = compareSpecToReport(specText as string, report);

    expect(comparison.missing).toEqual([]);
    expect(comparison.checked).toBe(4);
  });

  it('reports missing decorator expectations', () => {
    const cwd = path.resolve(process.cwd(), 'tests/fixtures/projects/spec-missing');
    const report = scanProject({ cwd, config: DEFAULT_CONFIG, includeGit: false });
    const specText = loadSpecText(cwd, './domain.spec.yaml');

    expect(specText).toBeDefined();
    const comparison = compareSpecToReport(specText as string, report);

    expect(comparison.missing).toContain('identifier: MissingDecorator');
  });
});
