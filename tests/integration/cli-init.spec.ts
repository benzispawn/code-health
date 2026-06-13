import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runCliAndCapture } from './cli-helper';

const tempRoots: string[] = [];

describe('code-health init', () => {
  afterEach(() => {
    for (const root of tempRoots.splice(0)) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('creates a default TypeScript config', async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'code-health-init-'));
    tempRoots.push(cwd);

    const output = await runCliAndCapture(['init'], cwd);
    const configPath = path.join(cwd, 'code-health.config.ts');

    expect(output).toContain('created code-health.config.ts');
    expect(fs.readFileSync(configPath, 'utf8')).toContain("decorator: ['*.decorator.ts']");
  });
});
