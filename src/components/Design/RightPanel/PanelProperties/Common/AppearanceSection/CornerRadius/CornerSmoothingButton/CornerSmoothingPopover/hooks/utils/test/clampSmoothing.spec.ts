// utils
import { clampSmoothing } from '../clampSmoothing';

describe('clampSmoothing', () => {
  it('should round and clamp the smoothing to 0-100', () => {
    // result
    expect(clampSmoothing(-5)).toBe(0);
    expect(clampSmoothing(59.6)).toBe(60);
    expect(clampSmoothing(140)).toBe(100);
  });
});
