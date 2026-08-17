// utils
import { getCornerRadiusFromPoint } from '../getCornerRadiusFromPoint';

const bounds = { height: 50, width: 100, x: 0, y: 0 };

describe('getCornerRadiusFromPoint', () => {
  it('should use leftward and downward insets for the ne corner', () => {
    // result
    expect(getCornerRadiusFromPoint({ x: 80, y: 10 }, bounds, 'ne')).toBe(20);
  });

  it('should reach the max radius from purely leftward movement alone on the ne corner', () => {
    // result — 30 leftward vs 0 downward, no diagonal movement needed, clamped to maxRadius (25)
    expect(getCornerRadiusFromPoint({ x: 70, y: 0 }, bounds, 'ne')).toBe(25);
  });

  it('should reach a radius from purely downward movement alone on the ne corner', () => {
    // result — 0 leftward vs 20 downward
    expect(getCornerRadiusFromPoint({ x: 100, y: 20 }, bounds, 'ne')).toBe(20);
  });

  it('should use rightward and downward insets for the nw corner', () => {
    // result
    expect(getCornerRadiusFromPoint({ x: 20, y: 10 }, bounds, 'nw')).toBe(20);
  });

  it('should use leftward and upward insets for the se corner', () => {
    // result
    expect(getCornerRadiusFromPoint({ x: 80, y: 40 }, bounds, 'se')).toBe(20);
  });

  it('should use rightward and upward insets for the sw corner', () => {
    // result
    expect(getCornerRadiusFromPoint({ x: 20, y: 40 }, bounds, 'sw')).toBe(20);
  });

  it('should clamp to 0 when the point moves past the corner, outside the shape', () => {
    // result
    expect(getCornerRadiusFromPoint({ x: 110, y: -5 }, bounds, 'ne')).toBe(0);
  });

  it('should clamp to the max radius (half the smaller dimension) when the point overshoots the center', () => {
    // result — height (50) is the smaller dimension, so max radius is 25
    expect(getCornerRadiusFromPoint({ x: 0, y: 0 }, bounds, 'ne')).toBe(25);
  });
});
