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
    const source = path.resolve(process.cwd(), 'tests/fixtures/projects/clean-valid');
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'code-health-report-'));
    tempRoots.push(cwd);
    fs.cpSync(source, cwd, { recursive: true });

    const output = await runCliAndCapture(['report', '--cwd', cwd, '--format', 'markdown']);
    const reportPath = path.join(cwd, 'reports/code-health/code-health-report.md');

    expect(output).toContain('created reports/code-health/code-health-report.md');
    expect(fs.readFileSync(reportPath, 'utf8')).toContain('# nestjs-project Code Health');
  });
});
