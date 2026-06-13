export function calculateCognitiveComplexity(source: string): number {
  const lines = source.split(/\r?\n/);
  let score = 0;
  let nesting = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      /^(if|for|while|switch|catch)\b/.test(trimmed) ||
      /\b(if|for|while|catch)\s*\(/.test(trimmed)
    ) {
      score += 1 + nesting;
    }
    if (/\belse\b/.test(trimmed)) {
      score += 1;
    }
    if (trimmed.includes("&&") || trimmed.includes("||")) {
      score += 1;
    }
    if (trimmed.endsWith("{")) {
      nesting += 1;
    }
    if (trimmed.startsWith("}")) {
      nesting = Math.max(0, nesting - 1);
    }
  }

  return score;
}
