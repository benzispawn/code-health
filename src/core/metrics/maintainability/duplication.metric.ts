export function estimateDuplicationPercent(sources: string[]): number {
  return calculateDuplicationMetrics(
    sources.map((source, index) => ({ path: String(index), source })),
  ).projectDuplicationPercent;
}

export interface DuplicationInput {
  path: string;
  source: string;
}

export interface DuplicationMetrics {
  projectDuplicationPercent: number;
  fileDuplicationPercent: Map<string, number>;
  groups: DuplicationGroup[];
}

export interface DuplicationGroup {
  fingerprint: string;
  normalizedText: string;
  occurrences: DuplicationOccurrence[];
  lineCount: number;
  severity: "Low" | "Medium" | "High";
}

export interface DuplicationOccurrence {
  file: string;
  lineStart: number;
  lineEnd: number;
}

interface MeaningfulLine {
  value: string;
  lineNumber: number;
}

const DEFAULT_MIN_BLOCK_LINES = 2;
const DEFAULT_MIN_LINE_LENGTH = 20;

export function calculateDuplicationMetrics(
  sources: DuplicationInput[],
): DuplicationMetrics {
  const lineOccurrences = new Map<string, Set<string>>();
  const fileLineCounts = new Map<string, number>();
  const fileDuplicatedLineCounts = new Map<string, number>();
  const groups = calculateDuplicationGroups(sources);

  for (const { path, source } of sources) {
    for (const { value: normalized } of meaningfulLines(source)) {
      fileLineCounts.set(path, (fileLineCounts.get(path) ?? 0) + 1);
      const paths = lineOccurrences.get(normalized) ?? new Set<string>();
      paths.add(path);
      lineOccurrences.set(normalized, paths);
    }
  }

  for (const { path, source } of sources) {
    for (const { value: normalized } of meaningfulLines(source)) {
      if ((lineOccurrences.get(normalized)?.size ?? 0) > 1) {
        fileDuplicatedLineCounts.set(
          path,
          (fileDuplicatedLineCounts.get(path) ?? 0) + 1,
        );
      }
    }
  }

  const fileDuplicationPercent = new Map<string, number>();
  let total = 0;
  let duplicated = 0;

  for (const { path } of sources) {
    const fileTotal = fileLineCounts.get(path) ?? 0;
    const fileDuplicated = fileDuplicatedLineCounts.get(path) ?? 0;
    total += fileTotal;
    duplicated += fileDuplicated;
    fileDuplicationPercent.set(
      path,
      fileTotal === 0 ? 0 : Math.round((fileDuplicated / fileTotal) * 100),
    );
  }

  return {
    projectDuplicationPercent:
      total === 0 ? 0 : Math.round((duplicated / total) * 100),
    fileDuplicationPercent,
    groups,
  };
}

function calculateDuplicationGroups(
  sources: DuplicationInput[],
): DuplicationGroup[] {
  const windows = new Map<string, DuplicationOccurrence[]>();

  for (const { path, source } of sources) {
    const lines = meaningfulLines(source);
    for (
      let index = 0;
      index <= lines.length - DEFAULT_MIN_BLOCK_LINES;
      index += 1
    ) {
      const block = lines.slice(index, index + DEFAULT_MIN_BLOCK_LINES);
      const normalizedText = block.map((line) => line.value).join("\n");
      const occurrences = windows.get(normalizedText) ?? [];
      occurrences.push({
        file: path,
        lineStart: block[0].lineNumber,
        lineEnd: block[block.length - 1].lineNumber,
      });
      windows.set(normalizedText, occurrences);
    }
  }

  const windowGroups = [...windows.entries()]
    .map(([normalizedText, occurrences]) => ({
      fingerprint: fingerprint(normalizedText),
      normalizedText,
      occurrences: mergeOccurrences(occurrences),
      lineCount: DEFAULT_MIN_BLOCK_LINES,
      severity: severityFor(DEFAULT_MIN_BLOCK_LINES, occurrences.length),
    }))
    .filter((group) => group.occurrences.length > 1);

  return mergeAdjacentGroups(windowGroups).sort((left, right) => {
    const leftScore = left.lineCount * left.occurrences.length;
    const rightScore = right.lineCount * right.occurrences.length;
    return rightScore - leftScore;
  });
}

function mergeAdjacentGroups(groups: DuplicationGroup[]): DuplicationGroup[] {
  const sorted = [...groups].sort((left, right) =>
    occurrenceShape(left).localeCompare(occurrenceShape(right)),
  );
  const merged: DuplicationGroup[] = [];

  for (const group of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && canMergeGroups(previous, group)) {
      previous.lineCount = Math.max(
        ...previous.occurrences.map(
          (occurrence, index) =>
            group.occurrences[index].lineEnd - occurrence.lineStart + 1,
        ),
      );
      previous.normalizedText = `${previous.normalizedText}\n${lastLine(group.normalizedText)}`;
      previous.fingerprint = fingerprint(previous.normalizedText);
      previous.occurrences = previous.occurrences.map((occurrence, index) => ({
        ...occurrence,
        lineEnd: group.occurrences[index].lineEnd,
      }));
      previous.severity = severityFor(
        previous.lineCount,
        previous.occurrences.length,
      );
      continue;
    }
    merged.push({
      ...group,
      occurrences: group.occurrences.map((occurrence) => ({ ...occurrence })),
    });
  }

  return merged;
}

function canMergeGroups(
  left: DuplicationGroup,
  right: DuplicationGroup,
): boolean {
  if (left.occurrences.length !== right.occurrences.length) {
    return false;
  }

  return left.occurrences.every((leftOccurrence, index) => {
    const rightOccurrence = right.occurrences[index];
    return (
      leftOccurrence.file === rightOccurrence.file &&
      rightOccurrence.lineStart <= leftOccurrence.lineEnd + 1 &&
      rightOccurrence.lineEnd > leftOccurrence.lineEnd
    );
  });
}

function occurrenceShape(group: DuplicationGroup): string {
  const fileShape = group.occurrences
    .map((occurrence) => occurrence.file)
    .join("|");
  const firstLine = group.occurrences[0]?.lineStart ?? 0;
  return `${fileShape}:${String(firstLine).padStart(8, "0")}`;
}

function lastLine(value: string): string {
  const lines = value.split("\n");
  return lines[lines.length - 1];
}

function meaningfulLines(source: string): MeaningfulLine[] {
  return source
    .split(/\r?\n/)
    .map((line, index) => ({
      value: normalizeLine(line),
      lineNumber: index + 1,
    }))
    .filter((line) => isMeaningfulLine(line.value));
}

function normalizeLine(line: string): string {
  return line.trim().replace(/\s+/g, " ");
}

function isMeaningfulLine(line: string): boolean {
  if (line.length < DEFAULT_MIN_LINE_LENGTH) {
    return false;
  }
  if (
    line.startsWith("import ") ||
    line.startsWith("//") ||
    line.startsWith("/*") ||
    line.startsWith("*") ||
    line === "{" ||
    line === "}"
  ) {
    return false;
  }
  return true;
}

function mergeOccurrences(
  occurrences: DuplicationOccurrence[],
): DuplicationOccurrence[] {
  const unique = new Map<string, DuplicationOccurrence>();
  for (const occurrence of occurrences) {
    unique.set(
      `${occurrence.file}:${occurrence.lineStart}:${occurrence.lineEnd}`,
      occurrence,
    );
  }
  return [...unique.values()].sort((left, right) =>
    `${left.file}:${left.lineStart}`.localeCompare(
      `${right.file}:${right.lineStart}`,
    ),
  );
}

function severityFor(
  lineCount: number,
  occurrenceCount: number,
): DuplicationGroup["severity"] {
  const score = lineCount * occurrenceCount;
  if (score >= 12) {
    return "High";
  }
  if (score >= 6) {
    return "Medium";
  }
  return "Low";
}

function fingerprint(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}
