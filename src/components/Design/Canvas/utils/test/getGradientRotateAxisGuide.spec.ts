// utils
import { getGradientRotateAxisGuide } from '../getGradientRotateAxisGuide';

const bounds = { height: 100, width: 200, x: 0, y: 0 };

describe('getGradientRotateAxisGuide', () => {
  it('should return a horizontal guide spanning the bounds width at the pivot y when snapped to 0deg', () => {
    const guide = getGradientRotateAxisGuide({ x: 100, y: 50 }, bounds, 0, 0);

    expect(guide.vertical).toBeNull();
    expect(guide.horizontal).toEqual({ anchor: { x: 0, y: 50 }, match: { x: 200, y: 50 } });
  });

  it('should return a horizontal guide when snapped to 180deg too', () => {
    const guide = getGradientRotateAxisGuide({ x: 100, y: 50 }, bounds, 0, 180);

    expect(guide.vertical).toBeNull();
    expect(guide.horizontal).not.toBeNull();
  });

  it('should return a vertical guide spanning the bounds height at the pivot x when snapped to 90deg', () => {
    const guide = getGradientRotateAxisGuide({ x: 100, y: 50 }, bounds, 0, 90);

    expect(guide.horizontal).toBeNull();
    expect(guide.vertical).toEqual({ anchor: { x: 100, y: 0 }, match: { x: 100, y: 100 } });
  });

  it('should return a vertical guide when snapped to -90deg too', () => {
    const guide = getGradientRotateAxisGuide({ x: 100, y: 50 }, bounds, 0, -90);

    expect(guide.horizontal).toBeNull();
    expect(guide.vertical).not.toBeNull();
  });

  it('should rotate the guide points into world space when the node itself is rotated', () => {
    // a square bounds rotated 90deg: the local horizontal guide should come out as a world-space
    // vertical-looking segment (its endpoints swap roles under a quarter turn around the center)
    const squareBounds = { height: 100, width: 100, x: 0, y: 0 };
    const guide = getGradientRotateAxisGuide({ x: 50, y: 50 }, squareBounds, 90, 0);

    expect(guide.horizontal!.anchor.x).toBeCloseTo(50, 5);
    expect(guide.horizontal!.anchor.y).toBeCloseTo(0, 5);
    expect(guide.horizontal!.match.x).toBeCloseTo(50, 5);
    expect(guide.horizontal!.match.y).toBeCloseTo(100, 5);
  });
});
