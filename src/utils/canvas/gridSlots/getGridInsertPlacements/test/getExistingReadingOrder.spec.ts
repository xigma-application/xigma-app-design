// types
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';

// utils
import { getExistingReadingOrder } from '../getExistingReadingOrder';

const placement = (id: string, columnStart: number, rowStart: number): TGridCellPlacement => ({
  columnSpan: 1,
  columnStart,
  id,
  rowSpan: 1,
  rowStart,
});

describe('getExistingReadingOrder', () => {
  it('should convert each placement to its reading index and sort them into reading order', () => {
    // mock — placements arrive out of reading order
    const placements = [placement('c', 0, 1), placement('a', 0, 0), placement('b', 1, 0)];

    // action
    const order = getExistingReadingOrder(placements, 2);

    // result
    expect(order).toEqual([
      { id: 'a', readingIndex: 0 },
      { id: 'b', readingIndex: 1 },
      { id: 'c', readingIndex: 2 },
    ]);
  });

  it('should return an empty list for an empty grid', () => {
    // action
    const order = getExistingReadingOrder([], 2);

    // result
    expect(order).toEqual([]);
  });
});
