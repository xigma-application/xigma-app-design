// utils
import { getDynamicStrokeNoise } from '../getDynamicStrokeNoise';

describe('getDynamicStrokeNoise', () => {
  it('should return the control values at the control points', () => {
    expect(getDynamicStrokeNoise([1, -1, 0.5], 0, 10, 0)).toBe(1);
    expect(getDynamicStrokeNoise([1, -1, 0.5], 10, 10, 0)).toBe(-1);
    expect(getDynamicStrokeNoise([1, -1, 0.5], 20, 10, 0)).toBe(0.5);
  });

  it('should wrap around so the loop closes without a seam', () => {
    expect(getDynamicStrokeNoise([1, -1, 0.5], 30, 10, 0)).toBe(1);
    expect(getDynamicStrokeNoise([1, -1, 0.5], 25, 10, 0)).toBeCloseTo(0.75);
  });

  it('should be linear (jagged) at Smoothen 0 and flatter near the control points at Smoothen 1', () => {
    expect(getDynamicStrokeNoise([0, 1], 2.5, 10, 0)).toBeCloseTo(0.25);
    expect(getDynamicStrokeNoise([0, 1], 2.5, 10, 1)).toBeCloseTo(0.15625);
    expect(getDynamicStrokeNoise([0, 1], 5, 10, 1)).toBeCloseTo(0.5);
  });
});
