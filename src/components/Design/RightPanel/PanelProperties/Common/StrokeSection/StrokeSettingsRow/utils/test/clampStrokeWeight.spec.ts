// utils
import { clampStrokeWeight } from '../clampStrokeWeight';

describe('clampStrokeWeight', () => {
  it('should clamp the weight to the allowed range', () => {
    // result
    expect(clampStrokeWeight(-4)).toBe(0);
    expect(clampStrokeWeight(12)).toBe(12);
    expect(clampStrokeWeight(5000)).toBe(1000);
  });
});
