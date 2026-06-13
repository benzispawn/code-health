export function calculateCyclomaticComplexity(source: string): number {
  const branchMatches = source.match(/\b(if|for|while|case|catch)\b|&&|\|\||\?/g);
  return 1 + (branchMatches?.length ?? 0);
}
