// utils
import { getGradientMoveSnapGuide } from '../getGradientMoveSnapGuide';

const bounds = { height: 100, width: 200, x: 0, y: 0 };

describe('getGradientMoveSnapGuide', () => {
  it('should return null when neither axis snapped', () => {
    expect(getGradientMoveSnapGuide({ x: 0.3, y: 0.3 }, bounds, 0, false, false)).toBeNull();
  });

  it('should return only a vertical guide when just x snapped', () => {
    const guide = getGradientMoveSnapGuide({ x: 0.5, y: 0.3 }, bounds, 0, true, false);

    expect(guide?.horizontal).toBeNull();
    expect(guide?.vertical).toEqual({ anchor: { x: 100, y: 0 }, match: { x: 100, y: 100 } });
  });

  it('should return only a horizontal guide when just y snapped', () => {
    const guide = getGradientMoveSnapGuide({ x: 0.3, y: 0.5 }, bounds, 0, false, true);

    expect(guide?.vertical).toBeNull();
    expect(guide?.horizontal).toEqual({ anchor: { x: 0, y: 50 }, match: { x: 200, y: 50 } });
  });

  it('should return both guides when both axes snapped, e.g. exactly at the center', () => {
    const guide = getGradientMoveSnapGuide({ x: 0.5, y: 0.5 }, bounds, 0, true, true);

    expect(guide?.horizontal).not.toBeNull();
    expect(guide?.vertical).not.toBeNull();
  });

  it('should rotate the guide points into world space when the node itself is rotated', () => {
    const squareBounds = { height: 100, width: 100, x: 0, y: 0 };
    const guide = getGradientMoveSnapGuide({ x: 0.5, y: 0 }, squareBounds, 90, false, true);

    // local horizontal guide along the top edge, (0,0)-(100,0); a 90deg rotation around the center
    // maps the top edge onto the right edge, (100,0)-(100,100)
    expect(guide?.horizontal!.anchor.x).toBeCloseTo(100, 5);
    expect(guide?.horizontal!.anchor.y).toBeCloseTo(0, 5);
    expect(guide?.horizontal!.match.x).toBeCloseTo(100, 5);
    expect(guide?.horizontal!.match.y).toBeCloseTo(100, 5);
  });
});
