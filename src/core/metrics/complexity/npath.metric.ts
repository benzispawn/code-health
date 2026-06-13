export function estimateNPathComplexity(source: string): number {
  const decisions =
    source.match(/\b(if|for|while|case|catch)\b|\?/g)?.length ?? 0;
  return Math.min(1000, Math.max(1, 2 ** Math.min(decisions, 10)));
}
