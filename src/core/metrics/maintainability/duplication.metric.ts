export function estimateDuplicationPercent(sources: string[]): number {
  const seen = new Map<string, number>();
  let total = 0;
  let duplicated = 0;

  for (const source of sources) {
    for (const line of source.split(/\r?\n/)) {
      const normalized = line.trim();
      if (normalized.length < 20 || normalized.startsWith('import ')) {
        continue;
      }
      total += 1;
      const count = seen.get(normalized) ?? 0;
      if (count > 0) {
        duplicated += 1;
      }
      seen.set(normalized, count + 1);
    }
  }

  return total === 0 ? 0 : Math.round((duplicated / total) * 100);
}
