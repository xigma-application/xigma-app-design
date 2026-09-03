// types
import { TGridGeometry } from 'types/design/smartSelection/types';

// utils
import { getGridColumnGapValues } from '../getGridColumnGapValues';

const geo = (columnX: number[]): TGridGeometry => ({
  columnWidth: columnX.map(() => 50),
  columnX,
  rowHeight: [50],
  rowY: [0],
});

describe('getGridColumnGapValues', () => {
  it('should return the uniform gap between every column', () => {
    expect(getGridColumnGapValues(geo([0, 100, 200]), 4)).toEqual([50, 50]);
  });

  it('should reject overlapping columns', () => {
    expect(getGridColumnGapValues(geo([0, 40]), 4)).toBeNull();
  });

  it('should reject non-uniform column gaps', () => {
    expect(getGridColumnGapValues(geo([0, 100, 400]), 4)).toBeNull();
  });
});
