// types
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';

// utils
import { getGridSlotMoveCandidate } from '../getGridSlotMoveCandidate';
import { occupyGridRegion } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/occupyGridRegion';

const placement = (overrides: Partial<TGridCellPlacement> = {}): TGridCellPlacement => ({
  columnSpan: 1,
  columnStart: 1,
  id: 'r1',
  rowSpan: 1,
  rowStart: 1,
  ...overrides,
});

describe('getGridSlotMoveCandidate', () => {
  it('should return null when there is no placement to move', () => {
    expect(getGridSlotMoveCandidate(undefined, { axis: 'column', step: 1 }, new Set(), 3, 3)).toBeNull();
  });

  it('should shift the column while leaving the row unchanged for a column-axis step', () => {
    expect(getGridSlotMoveCandidate(placement(), { axis: 'column', step: 1 }, new Set(), 3, 3)).toEqual({
      columnStart: 2,
      id: 'r1',
      rowStart: 1,
    });
  });

  it('should shift the row while leaving the column unchanged for a row-axis step', () => {
    expect(getGridSlotMoveCandidate(placement(), { axis: 'row', step: -1 }, new Set(), 3, 3)).toEqual({
      columnStart: 1,
      id: 'r1',
      rowStart: 0,
    });
  });

  it('should block when the target region is occupied by another node', () => {
    const occupied = new Set<string>();

    occupyGridRegion(occupied, 1, 2, 1, 1);

    expect(getGridSlotMoveCandidate(placement(), { axis: 'column', step: 1 }, occupied, 3, 3)).toBeNull();
  });

  it('should block when the move would land past the column track count', () => {
    expect(getGridSlotMoveCandidate(placement({ columnStart: 2 }), { axis: 'column', step: 1 }, new Set(), 3, 3)).toBeNull();
  });

  it('should block when the move would land past the row track count', () => {
    expect(getGridSlotMoveCandidate(placement({ rowStart: 2 }), { axis: 'row', step: 1 }, new Set(), 3, 3)).toBeNull();
  });

  it('should block when the move would go to a negative column index', () => {
    expect(getGridSlotMoveCandidate(placement({ columnStart: 0 }), { axis: 'column', step: -1 }, new Set(), 3, 3)).toBeNull();
  });

  it('should block when the move would go to a negative row index', () => {
    expect(getGridSlotMoveCandidate(placement({ rowStart: 0 }), { axis: 'row', step: -1 }, new Set(), 3, 3)).toBeNull();
  });

  it('should account for the full spanned region, not just the anchor cell, when checking collisions', () => {
    // moving right by 1 shifts this 2-wide item from columns [0,1] to [1,2] — occupying column 2 (not
    // touched by the item's own current cells) proves the check covers the whole shifted span
    const occupied = new Set<string>();

    occupyGridRegion(occupied, 0, 2, 1, 1);

    expect(
      getGridSlotMoveCandidate(placement({ columnSpan: 2, columnStart: 0, rowStart: 0 }), { axis: 'column', step: 1 }, occupied, 4, 4),
    ).toBeNull();
  });

  it('should account for the full spanned region when checking the row track bound', () => {
    expect(getGridSlotMoveCandidate(placement({ rowSpan: 2, rowStart: 1 }), { axis: 'row', step: 1 }, new Set(), 3, 3)).toBeNull();
  });
});
