export interface CrapScoreInput {
  complexity: number;
  coveragePercent?: number;
}

export function calculateCrapScore(input: CrapScoreInput): number | undefined {
  if (input.coveragePercent === undefined) {
    return undefined;
  }

  const coverageRatio = input.coveragePercent / 100;
  const crap =
    input.complexity * input.complexity * Math.pow(1 - coverageRatio, 3) +
    input.complexity;

  return Number(crap.toFixed(2));
}
