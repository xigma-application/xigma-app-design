// utils
import { buildGridRowGaps } from '../buildGridRowGaps';

describe('buildGridRowGaps', () => {
  it('should build one gap per value, spanning the full grid width', () => {
    const firstColumn = [
      { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: 'a' },
      { bounds: { height: 50, width: 50, x: 0, y: 100 }, id: 'b' },
    ];

    expect(buildGridRowGaps(firstColumn, [50], { left: 0, right: 200 })).toEqual([
      { index: 0, midpoint: { x: 100, y: 75 }, span: { x1: 0, x2: 200, y1: 75, y2: 75 }, value: 50 },
    ]);
  });
});
