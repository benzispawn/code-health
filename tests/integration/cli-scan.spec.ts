import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCliAndCapture } from './cli-helper';

describe('code-health scan', () => {
  it('prints project score and architecture findings', async () => {
    const cwd = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/layered-invalid',
    );
    const output = await runCliAndCapture(['scan', '--cwd', cwd]);

    expect(output).toContain('Project Health:');
    expect(output).toContain(
      'src/billing/billing.controller.ts: controller file imports disallowed repository file',
    );
    expect(output).toContain('Score Breakdown:');
    expect(output).toContain('- Coupling:');
    expect(output).toContain('Risk Signals:');
    expect(output).toContain('- Max Dependency Depth:');
    expect(output).toContain('- API Surface Size:');
    expect(output).toContain('- Line Coverage: not found');
  });

  it('prints CRAP risk signals when coverage-based CRAP is available', async () => {
    const cwd = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/mvp-metrics',
    );
    const output = await runCliAndCapture(['scan', '--cwd', cwd]);

    expect(output).toContain('- Max CRAP:');
  });

  it('prints conservative unused export candidates when present', async () => {
    const cwd = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/unused-exports',
    );
    const output = await runCliAndCapture(['scan', '--cwd', cwd]);

    expect(output).toContain('Unused Export Candidates:');
    expect(output).toContain(
      '- src/services/unused.service.ts: UnusedService (class)',
    );
  });
});
