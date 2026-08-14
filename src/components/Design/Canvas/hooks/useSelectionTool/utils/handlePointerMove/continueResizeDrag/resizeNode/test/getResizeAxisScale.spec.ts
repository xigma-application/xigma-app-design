// utils
import { getResizeAxisScale } from '../getResizeAxisScale';

describe('getResizeAxisScale', () => {
  it('should use the plain absolute world scale for a single (possibly rotated) node origin', () => {
    // result — rotation is ignored on this path since scaleX/scaleY are already in the node's own
    // local frame by the time a single-node origin reaches here (see getResizeQueryPoint)
    expect(getResizeAxisScale(-2, 3, 90, true)).toEqual({ x: 2, y: 3 });
  });

  it('should project the world scale onto the local axes for a group member origin', () => {
    // result — matches getRotatedAxisScales' own directly-verified 90deg swap
    const result = getResizeAxisScale(2, 3, 90, false);

    expect(result.x).toBeCloseTo(3);
    expect(result.y).toBeCloseTo(2);
  });
});
