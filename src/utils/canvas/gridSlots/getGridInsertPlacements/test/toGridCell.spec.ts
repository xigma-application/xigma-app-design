// utils
import { toGridCell } from '../toGridCell';

describe('toGridCell', () => {
  it('should wrap a reading index into a column/row pair for the given column count', () => {
    // action + result
    expect(toGridCell(0, 3)).toEqual({ column: 0, row: 0 });
    expect(toGridCell(2, 3)).toEqual({ column: 2, row: 0 });
    expect(toGridCell(3, 3)).toEqual({ column: 0, row: 1 });
    expect(toGridCell(7, 3)).toEqual({ column: 1, row: 2 });
  });

  it('should stack every index into a single column when the column count is 1', () => {
    // action + result
    expect(toGridCell(4, 1)).toEqual({ column: 0, row: 4 });
  });
});
