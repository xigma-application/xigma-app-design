// types
import { TGridGeometry } from 'types/design/smartSelection/types';

// utils
import { getGridRowGapValues } from '../getGridRowGapValues';

const geo = (rowY: number[]): TGridGeometry => ({
  columnWidth: [50],
  columnX: [0],
  rowHeight: rowY.map(() => 50),
  rowY,
});

describe('getGridRowGapValues', () => {
  it('should return the uniform gap between every row', () => {
    expect(getGridRowGapValues(geo([0, 100, 200]), 4)).toEqual([50, 50]);
  });

  it('should reject overlapping rows', () => {
    expect(getGridRowGapValues(geo([0, 40]), 4)).toBeNull();
  });

  it('should reject non-uniform row gaps', () => {
    expect(getGridRowGapValues(geo([0, 100, 400]), 4)).toBeNull();
  });
});
