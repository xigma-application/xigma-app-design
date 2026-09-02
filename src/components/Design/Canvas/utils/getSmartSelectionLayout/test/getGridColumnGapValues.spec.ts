// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getGridColumnGapValues } from '../getGridColumnGapValues';

const cell = (x: number): TSmartSelectionNode => ({ bounds: { height: 50, width: 50, x, y: 0 }, id: `${x}` });

describe('getGridColumnGapValues', () => {
  it('should return the uniform gap between every column, read off the first row', () => {
    expect(getGridColumnGapValues([[cell(0), cell(100), cell(200)]], 4)).toEqual([50, 50]);
  });

  it('should reject overlapping columns', () => {
    expect(getGridColumnGapValues([[cell(0), cell(40)]], 4)).toBeNull();
  });

  it('should reject non-uniform column gaps', () => {
    expect(getGridColumnGapValues([[cell(0), cell(100), cell(400)]], 4)).toBeNull();
  });
});
