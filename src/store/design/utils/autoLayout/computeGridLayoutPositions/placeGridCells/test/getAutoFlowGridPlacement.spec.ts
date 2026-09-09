// utils
import { getAutoFlowGridPlacement, TGridCursor } from '../getAutoFlowGridPlacement';
import { gridCellKey } from '../gridCellKey';

describe('getAutoFlowGridPlacement behaviors', () => {
  it('should place the child at the cursor and step the cursor past it', () => {
    // mock
    const cursor: TGridCursor = { column: 0, row: 0 };

    // action
    const placement = getAutoFlowGridPlacement('a', 2, 1, 1, cursor, new Set());

    // result
    expect(placement).toEqual({ columnSpan: 1, columnStart: 0, id: 'a', rowSpan: 1, rowStart: 0 });
    expect(cursor).toEqual({ column: 1, row: 0 });
  });

  it('should wrap the cursor to the next row once the last column is filled', () => {
    // mock
    const cursor: TGridCursor = { column: 1, row: 0 };

    // action
    getAutoFlowGridPlacement('a', 2, 1, 1, cursor, new Set());

    // result
    expect(cursor).toEqual({ column: 0, row: 1 });
  });

  it('should scan past occupied cells before placing', () => {
    // mock
    const cursor: TGridCursor = { column: 0, row: 0 };
    const occupied = new Set([gridCellKey(0, 0)]);

    // action
    const placement = getAutoFlowGridPlacement('a', 3, 1, 1, cursor, occupied);

    // result
    expect(placement).toMatchObject({ columnStart: 1, rowStart: 0 });
  });

  it('should push a wide child to the next row when it does not fit the remaining columns', () => {
    // mock
    const cursor: TGridCursor = { column: 2, row: 0 };

    // action
    const placement = getAutoFlowGridPlacement('a', 3, 2, 1, cursor, new Set());

    // result
    expect(placement).toMatchObject({ columnStart: 0, rowStart: 1 });
  });
});
