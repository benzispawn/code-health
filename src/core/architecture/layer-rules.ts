import path from 'node:path';
import type { CodeHealthConfig } from '../../shared/types/config';
import { matchesPattern } from '../scanner/file-scanner';

export function detectLayer(
  filePath: string,
  config: CodeHealthConfig,
): string | undefined {
  const normalized = filePath.split(path.sep).join('/');
  const fileName = path.basename(filePath);

  for (const [layer, patterns] of Object.entries(config.architecture.layers)) {
    if (
      patterns.some(
        (pattern) =>
          matchesPattern(fileName, pattern) ||
          matchesPattern(normalized, pattern),
      )
    ) {
      return layer;
    }
  }

  return undefined;
}
