import path from 'node:path';

export function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

export function relativePosix(from: string, to: string): string {
  return toPosixPath(path.relative(from, to));
}

export function stripExtension(filePath: string): string {
  return filePath.replace(/\.[cm]?[tj]sx?$/, '');
}
