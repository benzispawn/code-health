import fs from 'node:fs';
import path from 'node:path';

export function loadSpecText(cwd: string, specFile: string): string | undefined {
  const resolved = path.resolve(cwd, specFile);
  if (!fs.existsSync(resolved)) {
    return undefined;
  }
  return fs.readFileSync(resolved, 'utf8');
}
