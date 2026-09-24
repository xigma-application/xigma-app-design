// utils
import { getTidyUpTargets } from '../getTidyUpTargets';

describe('getTidyUpTargets', () => {
  // three layers with gaps of 10 and 40, so the most common (smaller, on the tie) gap of 10 wins
  it('should route a row, a column and a grid to their layouts', () => {
    // mock
    const row = [0, 20, 70].map((x) => ({ height: 10, width: 10, x, y: 0 }));
    const column = [0, 20, 70].map((y) => ({ height: 10, width: 10, x: 0, y }));
    const diagonal = [
      { height: 10, width: 10, x: 0, y: 0 },
      { height: 10, width: 10, x: 50, y: 50 },
    ];

    // result
    expect(getTidyUpTargets(row)[2]).toEqual({ x: 40, y: 0 });
    expect(getTidyUpTargets(column)[2]).toEqual({ x: 0, y: 40 });
    expect(getTidyUpTargets(diagonal)[1]).toEqual({ x: 0, y: 50 });
  });

  it('should keep piled-up layers where they are', () => {
    // mock
    const rects = [
      { height: 10, width: 10, x: 0, y: 0 },
      { height: 10, width: 10, x: 2, y: 2 },
    ];

    // result
    expect(getTidyUpTargets(rects)).toEqual([
      { x: 0, y: 0 },
      { x: 2, y: 2 },
    ]);
  });
});
