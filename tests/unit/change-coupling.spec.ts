import { describe, expect, it } from 'vitest';
import {
  analyzeChangeCoupling,
  parseGitNameOnlyLog,
} from '../../src/core/git/change-coupling';

describe('parseGitNameOnlyLog', () => {
  it('groups changed TypeScript files by commit and ignores non-TypeScript files', () => {
    const commits = parseGitNameOnlyLog(`__CODE_HEALTH_COMMIT__
src/a.ts
README.md
src/b.ts
__CODE_HEALTH_COMMIT__
src/a.ts
src/c.ts
`);

    expect(commits).toEqual([
      ['src/a.ts', 'src/b.ts'],
      ['src/a.ts', 'src/c.ts'],
    ]);
  });
});

describe('analyzeChangeCoupling', () => {
  it('reports repeated co-change relationships and strongest peers per file', () => {
    const result = analyzeChangeCoupling(
      [
        ['src/a.ts', 'src/b.ts'],
        ['src/a.ts', 'src/b.ts', 'src/c.ts'],
        ['src/a.ts', 'src/b.ts'],
        ['src/a.ts', 'src/c.ts'],
      ],
      { minSharedCommits: 2, maxFilesPerCommit: 10, topPeers: 2 },
    );

    expect(result.pairs).toEqual([
      {
        files: ['src/a.ts', 'src/b.ts'],
        sharedCommits: 3,
        couplingPercent: 100,
      },
      {
        files: ['src/a.ts', 'src/c.ts'],
        sharedCommits: 2,
        couplingPercent: 100,
      },
    ]);
    expect(result.byFile.get('src/a.ts')).toEqual([
      { file: 'src/b.ts', sharedCommits: 3, couplingPercent: 100 },
      { file: 'src/c.ts', sharedCommits: 2, couplingPercent: 100 },
    ]);
    expect(result.byFile.get('src/b.ts')).toEqual([
      { file: 'src/a.ts', sharedCommits: 3, couplingPercent: 100 },
    ]);
  });

  it('filters out weak pairs and oversized commits', () => {
    const result = analyzeChangeCoupling(
      [
        ['src/a.ts', 'src/b.ts', 'src/c.ts', 'src/d.ts'],
        ['src/a.ts', 'src/b.ts'],
        ['src/a.ts', 'src/c.ts'],
      ],
      { minSharedCommits: 2, maxFilesPerCommit: 3, topPeers: 3 },
    );

    expect(result.pairs).toEqual([]);
    expect(result.byFile.get('src/a.ts')).toEqual([]);
  });
});
