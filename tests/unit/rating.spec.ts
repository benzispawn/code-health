import { describe, expect, it } from 'vitest';
import {
  formatRating,
  rateApiSurface,
  rateCoverage,
  rateDependencyDepth,
  rateDuplication,
  ratePackageCycles,
  rateScore,
} from '../../src/core/reporting/rating';

describe('rating helpers', () => {
  it('rates higher-is-better scores', () => {
    expect(rateScore(95)).toBe('Excellent');
    expect(rateScore(85)).toBe('Good');
    expect(rateScore(70)).toBe('Medium');
    expect(rateScore(55)).toBe('Bad');
    expect(rateScore(20)).toBe('Extreme Bad');
  });

  it('rates lower-is-better risk signals', () => {
    expect(rateDuplication(1)).toBe('Excellent');
    expect(rateDuplication(15)).toBe('Bad');
    expect(rateDependencyDepth(8)).toBe('Medium');
    expect(rateApiSurface(353)).toBe('Extreme Bad');
    expect(ratePackageCycles(1)).toBe('Bad');
  });

  it('rates missing coverage as unknown and formats colors', () => {
    expect(rateCoverage(undefined)).toBe('Unknown');
    expect(formatRating('Medium')).toContain('\u001b[33m');
    expect(formatRating('Unknown')).toBe('(not available)');
  });
});
