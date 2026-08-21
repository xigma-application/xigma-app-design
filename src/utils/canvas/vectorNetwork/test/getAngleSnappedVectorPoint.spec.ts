// utils
import { getAngleSnappedVectorPoint } from '../getAngleSnappedVectorPoint';

describe('getAngleSnappedVectorPoint', () => {
  it('should leave the point untouched, unsnapped, when it coincides with the origin (zero distance)', () => {
    // action
    const result = getAngleSnappedVectorPoint({ x: 10, y: 10 }, { x: 10, y: 10 }, 1);

    // result
    expect(result).toEqual({ isSnapped: false, point: { x: 10, y: 10 } });
  });

  it('should leave the point untouched, unsnapped, when the angle is well outside the tolerance (45deg)', () => {
    // action
    const result = getAngleSnappedVectorPoint({ x: 0, y: 0 }, { x: 100, y: 100 }, 1);

    // result
    expect(result).toEqual({ isSnapped: false, point: { x: 100, y: 100 } });
  });

  it('should snap onto exact horizontal (0deg, to the right) when the raw angle is within tolerance, keeping the raw x and locking y to the origin', () => {
    // action
    const result = getAngleSnappedVectorPoint({ x: 0, y: 0 }, { x: 150, y: 5 }, 1);

    // result
    expect(result).toEqual({ isSnapped: true, point: { x: 150, y: 0 } });
  });

  it('should snap onto exact vertical (90deg, downward) when the raw angle is within tolerance, keeping the raw y and locking x to the origin', () => {
    // action
    const result = getAngleSnappedVectorPoint({ x: 0, y: 0 }, { x: 4, y: 150 }, 1);

    // result
    expect(result).toEqual({ isSnapped: true, point: { x: 0, y: 150 } });
  });

  it('should snap onto exact horizontal (180deg, to the left) when the raw angle is within tolerance', () => {
    // action
    const result = getAngleSnappedVectorPoint({ x: 0, y: 0 }, { x: -150, y: -5 }, 1);

    // result
    expect(result).toEqual({ isSnapped: true, point: { x: -150, y: 0 } });
  });

  it('should snap onto exact vertical (-90deg, upward) when the raw angle is within tolerance', () => {
    // action
    const result = getAngleSnappedVectorPoint({ x: 0, y: 0 }, { x: -4, y: -150 }, 1);

    // result
    expect(result).toEqual({ isSnapped: true, point: { x: 0, y: -150 } });
  });

  it('should snap relative to a non-origin vertex, not just the world origin', () => {
    // action
    const result = getAngleSnappedVectorPoint({ x: 200, y: 100 }, { x: 350, y: 102 }, 1);

    // result
    expect(result).toEqual({ isSnapped: true, point: { x: 350, y: 100 } });
  });

  it('should produce the exact same snapped point as hovering precisely on the axis, matching pixel-for-pixel', () => {
    // mock — a couple of px off horizontal vs. dead-on horizontal, both from the same origin
    // action
    const nearAxis = getAngleSnappedVectorPoint({ x: 700, y: 300 }, { x: 850, y: 304 }, 1);
    const onAxis = getAngleSnappedVectorPoint({ x: 700, y: 300 }, { x: 850, y: 300 }, 1);

    // result — both resolve to the identical point, not just numerically close
    expect(nearAxis).toEqual(onAxis);
  });

  it('should leave the point untouched, unsnapped, just outside the tolerance boundary at 100% zoom', () => {
    // mock — atan2(20, 150) ≈ 7.6deg, outside the 5deg base tolerance
    // action
    const result = getAngleSnappedVectorPoint({ x: 0, y: 0 }, { x: 150, y: 20 }, 1);

    // result
    expect(result).toEqual({ isSnapped: false, point: { x: 150, y: 20 } });
  });

  it('should keep the same tolerance when zoomed out below 100%, not grow it further', () => {
    // mock — same 7.6deg angle that misses at zoom 1, still outside the (unchanged) tolerance at zoom 0.2
    // action
    const result = getAngleSnappedVectorPoint({ x: 0, y: 0 }, { x: 150, y: 20 }, 0.2);

    // result
    expect(result.isSnapped).toBe(false);
  });

  it('should shrink the tolerance past 100% zoom, so an angle that snaps at 100% no longer does zoomed in', () => {
    // mock — atan2(5, 150) ≈ 1.9deg: within the 5deg base tolerance at zoom 1, but past the 0.5deg
    // (5 / 10) tolerance at zoom 10
    // action
    const atDefaultZoom = getAngleSnappedVectorPoint({ x: 0, y: 0 }, { x: 150, y: 5 }, 1);
    const atHighZoom = getAngleSnappedVectorPoint({ x: 0, y: 0 }, { x: 150, y: 5 }, 10);

    // result
    expect(atDefaultZoom.isSnapped).toBe(true);
    expect(atHighZoom.isSnapped).toBe(false);
  });

  it('should floor the shrinking tolerance at extreme zoom instead of letting it vanish to zero', () => {
    // mock — a near-exact-horizontal angle (0.2deg) still snaps even at an extreme zoom where
    // 5 / zoom would otherwise be far below the 0.5deg floor
    // action
    const result = getAngleSnappedVectorPoint({ x: 0, y: 0 }, { x: 1000, y: 3.5 }, 1000);

    // result
    expect(result.isSnapped).toBe(true);
  });
});
