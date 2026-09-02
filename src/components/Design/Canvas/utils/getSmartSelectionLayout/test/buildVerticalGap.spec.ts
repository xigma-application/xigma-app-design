// utils
import { buildVerticalGap } from '../buildVerticalGap';

describe('buildVerticalGap', () => {
  it('should centre the midpoint in the gap, on the overlap band of both nodes', () => {
    const before = { bounds: { height: 50, width: 100, x: 0, y: 0 }, id: 'a' };
    const after = { bounds: { height: 50, width: 60, x: 20, y: 100 }, id: 'b' };

    expect(buildVerticalGap(before, after, 0, 50)).toEqual({
      index: 0,
      midpoint: { x: 50, y: 75 },
      span: { x1: 20, x2: 80, y1: 75, y2: 75 },
      value: 50,
    });
  });
});
