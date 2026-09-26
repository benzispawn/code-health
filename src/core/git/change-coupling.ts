import { execFileSync } from 'node:child_process';

export interface CoupledFile {
  file: string;
  sharedCommits: number;
  couplingPercent: number;
}

export interface ChangeCouplingPair {
  files: [string, string];
  sharedCommits: number;
  couplingPercent: number;
}

export interface ChangeCouplingAnalysis {
  minSharedCommits: number;
  maxFilesPerCommit: number;
  pairs: ChangeCouplingPair[];
  byFile: Map<string, CoupledFile[]>;
}

export interface ChangeCouplingOptions {
  minSharedCommits?: number;
  maxFilesPerCommit?: number;
  topPeers?: number;
}

const COMMIT_SEPARATOR = '__CODE_HEALTH_COMMIT__';

export function readGitChangeSets(cwd: string, days = 90): string[][] {
  try {
    const output = execFileSync(
      'git',
      [
        'log',
        `--since=${days} days ago`,
        '--name-only',
        `--pretty=format:${COMMIT_SEPARATOR}`,
      ],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    return parseGitNameOnlyLog(output);
  } catch {
    return [];
  }
}

export function parseGitNameOnlyLog(output: string): string[][] {
  return output
    .split(COMMIT_SEPARATOR)
    .map((chunk) => [
      ...new Set(
        chunk
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((file) => file.endsWith('.ts')),
      ),
    ])
    .filter((files) => files.length > 0);
}

export function analyzeChangeCoupling(
  commitFileSets: string[][],
  options: ChangeCouplingOptions = {},
): ChangeCouplingAnalysis {
  const minSharedCommits = options.minSharedCommits ?? 2;
  const maxFilesPerCommit = options.maxFilesPerCommit ?? 6;
  const topPeers = options.topPeers ?? 3;
  const pairCounts = new Map<string, number>();
  const fileCommitCounts = new Map<string, number>();
  const analyzedFiles = new Set<string>();

  for (const commitFiles of commitFileSets) {
    const uniqueFiles = [...new Set(commitFiles)].sort();
    if (uniqueFiles.length < 2 || uniqueFiles.length > maxFilesPerCommit) {
      continue;
    }

    for (const file of uniqueFiles) {
      analyzedFiles.add(file);
      fileCommitCounts.set(file, (fileCommitCounts.get(file) ?? 0) + 1);
    }

    for (let index = 0; index < uniqueFiles.length; index += 1) {
      for (
        let targetIndex = index + 1;
        targetIndex < uniqueFiles.length;
        targetIndex += 1
      ) {
        const left = uniqueFiles[index];
        const right = uniqueFiles[targetIndex];
        const key = pairKey(left, right);
        pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
      }
    }
  }

  const pairs = [...pairCounts.entries()]
    .map(([key, sharedCommits]) => {
      const [left, right] = key.split('::');
      if (sharedCommits < minSharedCommits) {
        return undefined;
      }

      const leftCommits = fileCommitCounts.get(left) ?? 0;
      const rightCommits = fileCommitCounts.get(right) ?? 0;
      const baseline = Math.min(leftCommits, rightCommits);
      const couplingPercent =
        baseline === 0 ? 0 : Math.round((sharedCommits / baseline) * 100);

      return {
        files: [left, right] as [string, string],
        sharedCommits,
        couplingPercent,
      };
    })
    .filter((pair): pair is ChangeCouplingPair => pair !== undefined)
    .sort(
      (left, right) =>
        right.sharedCommits - left.sharedCommits ||
        right.couplingPercent - left.couplingPercent ||
        left.files[0].localeCompare(right.files[0]) ||
        left.files[1].localeCompare(right.files[1]),
    );

  const byFile = new Map<string, CoupledFile[]>();

  for (const file of analyzedFiles) {
    byFile.set(file, []);
  }

  for (const pair of pairs) {
    addPeer(byFile, pair.files[0], {
      file: pair.files[1],
      sharedCommits: pair.sharedCommits,
      couplingPercent: pair.couplingPercent,
    });
    addPeer(byFile, pair.files[1], {
      file: pair.files[0],
      sharedCommits: pair.sharedCommits,
      couplingPercent: pair.couplingPercent,
    });
  }

  for (const [file, peers] of byFile) {
    byFile.set(
      file,
      peers
        .sort(
          (left, right) =>
            right.sharedCommits - left.sharedCommits ||
            right.couplingPercent - left.couplingPercent ||
            left.file.localeCompare(right.file),
        )
        .slice(0, topPeers),
    );
  }

  return {
    minSharedCommits,
    maxFilesPerCommit,
    pairs,
    byFile,
  };
}

function pairKey(left: string, right: string): string {
  return `${left}::${right}`;
}

function addPeer(
  byFile: Map<string, CoupledFile[]>,
  file: string,
  peer: CoupledFile,
): void {
  const existing = byFile.get(file) ?? [];
  existing.push(peer);
  byFile.set(file, existing);
}
