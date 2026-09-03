// types
import { TGridGeometry } from 'types/design/smartSelection/types';

// utils
import { buildGridRowGaps } from '../buildGridRowGaps';

const GEOMETRY: TGridGeometry = { columnWidth: [50], columnX: [0], rowHeight: [50, 50], rowY: [0, 100] };

describe('buildGridRowGaps', () => {
  it('should build one gap per value, spanning the full grid width', () => {
    expect(buildGridRowGaps(GEOMETRY, [50], { left: 0, right: 200 })).toEqual([
      { index: 0, midpoint: { x: 100, y: 75 }, span: { x1: 0, x2: 200, y1: 75, y2: 75 }, value: 50 },
    ]);
  });
});
