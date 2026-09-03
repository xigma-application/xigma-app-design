// types
import { TGridGeometry } from 'types/design/smartSelection/types';

// utils
import { buildGridColumnGaps } from '../buildGridColumnGaps';

const geo = (rowY: number[]): TGridGeometry => ({
  columnWidth: [50, 50],
  columnX: [0, 100],
  rowHeight: rowY.map(() => 50),
  rowY,
});

describe('buildGridColumnGaps', () => {
  it('should build one gap per row, each spanning the full grid height, for a single-row grid', () => {
    expect(buildGridColumnGaps(geo([0]), [50], { bottom: 200, top: 0 })).toEqual([
      { index: 0, midpoint: { x: 75, y: 25 }, span: { x1: 75, x2: 75, y1: 0, y2: 200 }, value: 50 },
    ]);
  });

  it('should build one gap per row per column boundary, each anchored to its own row', () => {
    expect(buildGridColumnGaps(geo([0, 100]), [50], { bottom: 150, top: 0 })).toEqual([
      { index: 0, midpoint: { x: 75, y: 25 }, span: { x1: 75, x2: 75, y1: 0, y2: 150 }, value: 50 },
      { index: 0, midpoint: { x: 75, y: 125 }, span: { x1: 75, x2: 75, y1: 0, y2: 150 }, value: 50 },
    ]);
  });
});
