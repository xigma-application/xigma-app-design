// utils
import { normalizeVector } from '../normalizeVector';

describe('normalizeVector', () => {
  it('should scale a vector down to unit length, keeping its direction', () => {
    // result
    expect(normalizeVector({ x: 3, y: 4 })).toEqual({ x: 0.6, y: 0.8 });
  });

  it('should leave an already-unit vector unchanged', () => {
    // result
    expect(normalizeVector({ x: 1, y: 0 })).toEqual({ x: 1, y: 0 });
  });
});
