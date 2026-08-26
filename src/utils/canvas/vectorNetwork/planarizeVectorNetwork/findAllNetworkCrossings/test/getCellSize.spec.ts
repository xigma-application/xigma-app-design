// utils
import { getCellSize } from '../getCellSize';

describe('getCellSize', () => {
  it('should return 1 for an empty list, without dividing by zero', () => {
    expect(getCellSize([])).toBe(1);
  });

  it('should derive a cell size roughly targeting one box per cell', () => {
    // mock — a 100x100 area with 4 evenly-spread boxes: area 10000 / 4 boxes = 2500, sqrt = 50
    const boxes = [
      { maxX: 10, maxY: 10, minX: 0, minY: 0 },
      { maxX: 100, maxY: 10, minX: 90, minY: 0 },
      { maxX: 10, maxY: 100, minX: 0, minY: 90 },
      { maxX: 100, maxY: 100, minX: 90, minY: 90 },
    ];

    expect(getCellSize(boxes)).toBeCloseTo(50, 4);
  });

  it('should never return less than 1, even for a degenerate (zero-area) extent', () => {
    const boxes = [{ maxX: 0, maxY: 0, minX: 0, minY: 0 }];

    expect(getCellSize(boxes)).toBe(1);
  });
});
