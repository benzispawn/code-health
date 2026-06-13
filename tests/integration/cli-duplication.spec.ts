import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCliAndCapture } from './cli-helper';

describe('code-health duplication', () => {
  it('prints duplicated blocks and locations', async () => {
    const cwd = path.resolve(process.cwd(), 'tests/fixtures/projects/mvp-metrics');
    const output = await runCliAndCapture(['duplication', '--cwd', cwd]);

    expect(output).toContain('Duplication:');
    expect(output).toContain('Top Duplicate Blocks:');
    expect(output).toContain('src/billing/billing.service.ts:');
    expect(output).toContain('src/billing/billing.helper.ts:');
  });

  it('prints duplication details from scan flag', async () => {
    const cwd = path.resolve(process.cwd(), 'tests/fixtures/projects/mvp-metrics');
    const output = await runCliAndCapture(['scan', '--cwd', cwd, '--duplication']);

    expect(output).toContain('Project Health:');
    expect(output).toContain('Top Duplicate Blocks:');
  });

  it('can output duplication JSON', async () => {
    const cwd = path.resolve(process.cwd(), 'tests/fixtures/projects/mvp-metrics');
    const output = await runCliAndCapture(['duplication', '--cwd', cwd, '--json']);
    const parsed = JSON.parse(output) as { percent: number; groups: Array<{ occurrences: unknown[] }> };

    expect(parsed.percent).toBeGreaterThan(0);
    expect(parsed.groups[0].occurrences.length).toBeGreaterThan(1);
  });
});
