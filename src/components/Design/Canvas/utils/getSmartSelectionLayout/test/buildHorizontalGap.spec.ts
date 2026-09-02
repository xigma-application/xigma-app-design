// utils
import { buildHorizontalGap } from '../buildHorizontalGap';

describe('buildHorizontalGap', () => {
  it('should centre the midpoint in the gap, on the overlap band of both nodes', () => {
    const before = { bounds: { height: 100, width: 50, x: 0, y: 0 }, id: 'a' };
    const after = { bounds: { height: 60, width: 50, x: 100, y: 20 }, id: 'b' };

    expect(buildHorizontalGap(before, after, 0, 50)).toEqual({
      index: 0,
      midpoint: { x: 75, y: 50 },
      span: { x1: 75, x2: 75, y1: 20, y2: 80 },
      value: 50,
    });
  });
});
