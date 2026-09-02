// utils
import { buildGridColumnGaps } from '../buildGridColumnGaps';

describe('buildGridColumnGaps', () => {
  it('should build one gap per value, spanning the full grid height', () => {
    const firstRow = [
      { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: 'a' },
      { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: 'b' },
    ];

    expect(buildGridColumnGaps(firstRow, [50], { bottom: 200, top: 0 })).toEqual([
      { index: 0, midpoint: { x: 75, y: 100 }, span: { x1: 75, x2: 75, y1: 0, y2: 200 }, value: 50 },
    ]);
  });
});
