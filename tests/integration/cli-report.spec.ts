import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runCliAndCapture } from './cli-helper';

const tempRoots: string[] = [];

describe('code-health report', () => {
  afterEach(() => {
    for (const root of tempRoots.splice(0)) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('writes markdown reports to the configured reports directory', async () => {
    const source = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/mvp-metrics',
    );
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'code-health-report-'));
    tempRoots.push(cwd);
    fs.cpSync(source, cwd, { recursive: true });

    const output = await runCliAndCapture([
      'report',
      '--cwd',
      cwd,
      '--format',
      'markdown',
    ]);
    const reportPath = path.join(
      cwd,
      'reports/code-health/code-health-report.md',
    );

    expect(output).toContain(
      'created reports/code-health/code-health-report.md',
    );
    const markdown = fs.readFileSync(reportPath, 'utf8');
    expect(markdown).toContain('# nestjs-project Code Health');
    expect(markdown).toContain('- Max CRAP:');
    expect(markdown).toContain('| File | Score | LOC | Logical LOC | Comments | Duplication | Fan-in | Fan-out | Depth | Exports | Endpoints | Coverage | CRAP | Coupled Peers |');
  });

  it('writes unused export candidate sections conservatively', async () => {
    const source = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/unused-exports',
    );
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'code-health-report-'));
    tempRoots.push(cwd);
    fs.cpSync(source, cwd, { recursive: true });

    await runCliAndCapture(['report', '--cwd', cwd, '--format', 'markdown']);
    const reportPath = path.join(
      cwd,
      'reports/code-health/code-health-report.md',
    );
    const markdown = fs.readFileSync(reportPath, 'utf8');

    expect(markdown).toContain('## Unused Export Candidates');
    expect(markdown).toContain(
      '| src/services/unused.service.ts | UnusedService | class | Named export has no internal named-import consumers |',
    );
  });
});
