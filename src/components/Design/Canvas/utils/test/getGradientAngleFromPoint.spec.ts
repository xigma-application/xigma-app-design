// utils
import { getGradientAngleFromPoint } from '../getGradientAngleFromPoint';

describe('getGradientAngleFromPoint', () => {
  const bounds = { height: 100, width: 100, x: 0, y: 0 };

  it('should return 0 for a point directly right of the center', () => {
    expect(getGradientAngleFromPoint({ x: 100, y: 50 }, bounds, 0)).toBeCloseTo(0, 5);
  });

  it('should return a positive quarter-turn for a point directly below the center', () => {
    expect(getGradientAngleFromPoint({ x: 50, y: 100 }, bounds, 0)).toBeCloseTo(Math.PI / 2, 5);
  });

  it('should return a negative quarter-turn for a point directly above the center', () => {
    expect(getGradientAngleFromPoint({ x: 50, y: 0 }, bounds, 0)).toBeCloseTo(-Math.PI / 2, 5);
  });

  it('should account for the node rotation by unrotating the point first', () => {
    // a point directly below the (unrotated) center of a node rotated 90deg is, in world space,
    // directly to the left of the center — unrotating it back should still read as "straight down"
    expect(getGradientAngleFromPoint({ x: 0, y: 50 }, bounds, 90)).toBeCloseTo(Math.PI / 2, 5);
  });

  it('should measure the angle from a custom pivot instead of the bounds center when given one', () => {
    const pivot = { x: 20, y: 20 };

    expect(getGradientAngleFromPoint({ x: 20, y: 100 }, bounds, 0, pivot)).toBeCloseTo(Math.PI / 2, 5);
    expect(getGradientAngleFromPoint({ x: 100, y: 20 }, bounds, 0, pivot)).toBeCloseTo(0, 5);
  });

  it('should still unrotate by node rotation first even with a custom pivot', () => {
    // same rotated-node setup as above, but measured from an off-center pivot at the bounds center
    // (0,50) in world space, rotated 90deg, unrotates to local (50,100) — straight down from (50,50)
    const pivot = { x: 50, y: 50 };

    expect(getGradientAngleFromPoint({ x: 0, y: 50 }, bounds, 90, pivot)).toBeCloseTo(Math.PI / 2, 5);
  });
});
