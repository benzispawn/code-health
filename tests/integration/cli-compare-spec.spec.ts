import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCliAndCapture } from './cli-helper';

describe('code-health compare-spec', () => {
  it('passes when code satisfies spec artifacts, methods, and decorators', async () => {
    const cwd = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/clean-valid',
    );
    const output = await runCliAndCapture(['compare-spec', '--cwd', cwd]);

    expect(output).toContain('Spec checks: 4');
    expect(output).toContain('Spec compliance: OK');
  });

  it('prints missing implementation items', async () => {
    const cwd = path.resolve(
      process.cwd(),
      'tests/fixtures/projects/spec-missing',
    );
    const output = await runCliAndCapture(['compare-spec', '--cwd', cwd]);

    expect(output).toContain('Missing implementation:');
    expect(output).toContain('identifier: MissingDecorator');
  });
});
