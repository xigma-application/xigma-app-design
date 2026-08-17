// utils
import { getCornerRadiusHandleSetbackMultiplier } from '../getCornerRadiusHandleSetbackMultiplier';

describe('getCornerRadiusHandleSetbackMultiplier', () => {
  it('should equal 2 at a 60deg vertex (an equilateral triangle tip)', () => {
    // result
    expect(getCornerRadiusHandleSetbackMultiplier(Math.PI / 3)).toBeCloseTo(2, 10);
  });

  it('should be just above 1 at a wide (obtuse) vertex, like a regular hexagon corner', () => {
    // result — 120deg interior angle
    expect(getCornerRadiusHandleSetbackMultiplier((2 * Math.PI) / 3)).toBeCloseTo(1.154701, 5);
  });

  it('should grow well above 1 at a sharp (acute) vertex, like a star tip', () => {
    // result — a ~36deg vertex, typical of a 5-point star's outer tip
    expect(getCornerRadiusHandleSetbackMultiplier(Math.PI / 5)).toBeCloseTo(3.236068, 5);
  });

  it('should approach 1 (not 0) as the vertex angle approaches a straight line (180deg)', () => {
    // result — sin(90deg) = 1, so the multiplier approaches 1 at a right angle, matching a
    // rectangle-style corner where the handle sits exactly `radius` away from the vertex
    expect(getCornerRadiusHandleSetbackMultiplier(Math.PI - 0.001)).toBeCloseTo(1, 3);
  });
});
