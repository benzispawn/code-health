export interface CoverageMap {
  [filePath: string]: number;
}

export function readLcovCoverage(_cwd: string): CoverageMap {
  return {};
}
