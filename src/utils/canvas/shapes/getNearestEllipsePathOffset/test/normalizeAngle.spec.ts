// utils
import { normalizeAngle } from '../normalizeAngle';

describe('normalizeAngle', () => {
  it('should leave an angle already within [0, 2*PI) unchanged', () => {
    // result
    expect(normalizeAngle(1)).toBeCloseTo(1);
  });

  it('should wrap a negative angle into [0, 2*PI)', () => {
    // result
    expect(normalizeAngle(-1)).toBeCloseTo(2 * Math.PI - 1);
  });

  it('should wrap an angle greater than 2*PI back into range', () => {
    // result
    expect(normalizeAngle(2 * Math.PI + 1)).toBeCloseTo(1);
  });

  it('should treat exactly 0 as already normalized', () => {
    // result
    expect(normalizeAngle(0)).toBe(0);
  });
});
