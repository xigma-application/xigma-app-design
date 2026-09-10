// types
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';

// utils
import { getGridOccupancyExcludingNode } from '../getGridOccupancyExcludingNode';

const placement = (overrides: Partial<TGridCellPlacement> = {}): TGridCellPlacement => ({
  columnSpan: 1,
  columnStart: 0,
  id: 'a',
  rowSpan: 1,
  rowStart: 0,
  ...overrides,
});

describe('getGridOccupancyExcludingNode', () => {
  it('should mark every cell covered by the other placements', () => {
    const occupied = getGridOccupancyExcludingNode([placement({ columnSpan: 2, id: 'b', rowSpan: 2 })], 'a');

    expect(occupied.has('0:0')).toBe(true);
    expect(occupied.has('0:1')).toBe(true);
    expect(occupied.has('1:0')).toBe(true);
    expect(occupied.has('1:1')).toBe(true);
  });

  it('should exclude the given node id from the occupancy', () => {
    const occupied = getGridOccupancyExcludingNode([placement({ id: 'a' })], 'a');

    expect(occupied.size).toBe(0);
  });

  it('should return an empty set for no placements', () => {
    expect(getGridOccupancyExcludingNode([], 'a').size).toBe(0);
  });
});
