import { describe, expect, it } from 'vitest';
import { calculateCrapScore } from '../../src/core/metrics/testability/crap-score.metric';

describe('calculateCrapScore', () => {
  it('scores complex low-coverage code higher than well-covered code', () => {
    const lowCoverage = calculateCrapScore({
      complexity: 20,
      coveragePercent: 20,
    });
    const highCoverage = calculateCrapScore({
      complexity: 20,
      coveragePercent: 90,
    });

    expect(lowCoverage).toBeGreaterThan(highCoverage);
    expect(lowCoverage).toBeGreaterThan(20);
  });

  it('returns undefined when coverage is unavailable', () => {
    expect(
      calculateCrapScore({
        complexity: 12,
        coveragePercent: undefined,
      }),
    ).toBeUndefined();
  });
});
