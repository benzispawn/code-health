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
});
