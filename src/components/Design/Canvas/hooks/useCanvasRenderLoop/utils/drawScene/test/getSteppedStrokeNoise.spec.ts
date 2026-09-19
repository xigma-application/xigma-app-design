// utils
import { getSteppedStrokeNoise } from '../getSteppedStrokeNoise';

describe('getSteppedStrokeNoise', () => {
  it('should stay flat for most of a wavelength and only change near its end', () => {
    // result
    expect(getSteppedStrokeNoise([0, 1], 2, 10, 0.2)).toBe(0);
    expect(getSteppedStrokeNoise([0, 1], 7, 10, 0.2)).toBe(0);
    expect(getSteppedStrokeNoise([0, 1], 9, 10, 0.2)).toBeCloseTo(0.5);
    expect(getSteppedStrokeNoise([0, 1], 10, 10, 0.2)).toBe(1);
  });

  it('should wrap around so the loop closes', () => {
    // result
    expect(getSteppedStrokeNoise([0, 1], 20, 10, 0.2)).toBe(0);
  });
});
