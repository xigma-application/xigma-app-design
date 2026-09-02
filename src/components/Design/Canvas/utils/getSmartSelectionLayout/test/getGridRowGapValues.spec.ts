// types
import { TSmartSelectionNode } from 'types/design/smartSelection/types';

// utils
import { getGridRowGapValues } from '../getGridRowGapValues';

const row = (y: number): TSmartSelectionNode[] => [{ bounds: { height: 50, width: 50, x: 0, y }, id: `${y}` }];

describe('getGridRowGapValues', () => {
  it('should return the uniform gap between every row, read off the first column', () => {
    expect(getGridRowGapValues([row(0), row(100), row(200)], 4)).toEqual([50, 50]);
  });

  it('should reject overlapping rows', () => {
    expect(getGridRowGapValues([row(0), row(40)], 4)).toBeNull();
  });

  it('should reject non-uniform row gaps', () => {
    expect(getGridRowGapValues([row(0), row(100), row(400)], 4)).toBeNull();
  });
});
