import { describe, it, expect } from 'vitest';
import { calculateWeightedRating } from '../src/shared/utils/rating.js';
import { escapeLike } from '../src/shared/utils/escapeLike.js';

describe('Unit utilities', () => {
  it('calculates weighted rating accurately', () => {
    expect(calculateWeightedRating(0, 0, 3.0)).toBe(0);
    const score1 = calculateWeightedRating(1, 5.0, 3.0);
    expect(score1).toBeCloseTo((1 * 5 + 5 * 3) / 6, 2);
    const score200 = calculateWeightedRating(200, 4.7, 3.0);
    expect(score200).toBeGreaterThan(score1);
  });

  it('escapes SQL LIKE wildcards correctly', () => {
    expect(escapeLike('test%string_with\\slashes')).toBe('test\\%string\\_with\\\\slashes');
    expect(escapeLike('normal query')).toBe('normal query');
    expect(escapeLike(null)).toBe('');
  });
});
