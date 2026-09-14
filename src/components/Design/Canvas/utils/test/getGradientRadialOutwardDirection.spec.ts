// utils
import { getGradientRadialOutwardDirection } from '../getGradientRadialOutwardDirection';

describe('getGradientRadialOutwardDirection', () => {
  it('should return the unit vector pointing from the center toward the point', () => {
    // before
    const direction = getGradientRadialOutwardDirection({ x: 10, y: 0 }, { x: 0, y: 0 });

    // result
    expect(direction).toEqual({ x: 1, y: 0 });
  });

  it('should normalize a diagonal direction', () => {
    // before
    const direction = getGradientRadialOutwardDirection({ x: 3, y: 4 }, { x: 0, y: 0 });

    // result
    expect(direction.x).toBeCloseTo(0.6, 5);
    expect(direction.y).toBeCloseTo(0.8, 5);
  });

  it('should fall back to pointing up when the point coincides with the center', () => {
    // before
    const direction = getGradientRadialOutwardDirection({ x: 5, y: 5 }, { x: 5, y: 5 });

    // result
    expect(direction).toEqual({ x: 0, y: -1 });
  });
});
