// utils
import { buildGridColumnGaps } from '../buildGridColumnGaps';

describe('buildGridColumnGaps', () => {
  it('should build one gap per row, each spanning the full grid height, for a single-row grid', () => {
    const row = [
      { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: 'a' },
      { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: 'b' },
    ];

    expect(buildGridColumnGaps([row], [50], { bottom: 200, top: 0 })).toEqual([
      { index: 0, midpoint: { x: 75, y: 25 }, span: { x1: 75, x2: 75, y1: 0, y2: 200 }, value: 50 },
    ]);
  });

  it('should build one gap per row per column boundary, each anchored to its own row', () => {
    const rowA = [
      { bounds: { height: 50, width: 50, x: 0, y: 0 }, id: 'a' },
      { bounds: { height: 50, width: 50, x: 100, y: 0 }, id: 'b' },
    ];
    const rowB = [
      { bounds: { height: 50, width: 50, x: 0, y: 100 }, id: 'c' },
      { bounds: { height: 50, width: 50, x: 100, y: 100 }, id: 'd' },
    ];

    expect(buildGridColumnGaps([rowA, rowB], [50], { bottom: 150, top: 0 })).toEqual([
      { index: 0, midpoint: { x: 75, y: 25 }, span: { x1: 75, x2: 75, y1: 0, y2: 150 }, value: 50 },
      { index: 0, midpoint: { x: 75, y: 125 }, span: { x1: 75, x2: 75, y1: 0, y2: 150 }, value: 50 },
    ]);
  });
});
