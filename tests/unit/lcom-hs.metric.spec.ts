import { describe, expect, it } from 'vitest';
import { calculateLcomHs } from '../../src/core/metrics/design/lcom-hs.metric';

describe('calculateLcomHs', () => {
  it('returns a lower value for cohesive classes', () => {
    const result = calculateLcomHs({
      fieldNames: ['plans', 'usage'],
      methodFieldUsage: [
        new Set(['plans', 'usage']),
        new Set(['plans', 'usage']),
        new Set(['plans', 'usage']),
      ],
    });

    expect(result).toEqual({
      fieldCount: 2,
      methodCount: 3,
      methodFieldIntersections: 6,
      lcomHs: 0,
    });
  });

  it('returns a higher value for split-responsibility classes', () => {
    const result = calculateLcomHs({
      fieldNames: ['plans', 'usage', 'mailer'],
      methodFieldUsage: [
        new Set(['plans']),
        new Set(['usage']),
        new Set(['mailer']),
      ],
    });

    expect(result).toEqual({
      fieldCount: 3,
      methodCount: 3,
      methodFieldIntersections: 3,
      lcomHs: 1,
    });
  });

  it('returns undefined for tiny classes where cohesion is not meaningful', () => {
    const result = calculateLcomHs({
      fieldNames: ['plans'],
      methodFieldUsage: [new Set(['plans'])],
    });

    expect(result).toEqual({
      fieldCount: 1,
      methodCount: 1,
      methodFieldIntersections: 1,
      lcomHs: undefined,
    });
  });
});
