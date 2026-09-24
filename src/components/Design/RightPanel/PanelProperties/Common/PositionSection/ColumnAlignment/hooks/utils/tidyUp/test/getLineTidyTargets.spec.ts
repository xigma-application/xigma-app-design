// utils
import { getLineTidyTargets } from '../getLineTidyTargets';

describe('getLineTidyTargets', () => {
  it("should lay a row out left to right from its leftmost layer with the most common gap, keeping each layer's y", () => {
    // mock: gaps 10, 10, 40 in position order, listed out of order
    const rects = [
      { height: 10, width: 10, x: 40, y: 3 },
      { height: 10, width: 10, x: 0, y: 0 },
      { height: 10, width: 20, x: 90, y: 1 },
      { height: 10, width: 10, x: 20, y: 2 },
    ];

    // result
    expect(getLineTidyTargets(rects, true)).toEqual([
      { x: 40, y: 3 },
      { x: 0, y: 0 },
      { x: 60, y: 1 },
      { x: 20, y: 2 },
    ]);
  });

  it("should lay a column out top to bottom, keeping each layer's x", () => {
    // mock
    const rects = [
      { height: 10, width: 10, x: 1, y: 0 },
      { height: 20, width: 10, x: 2, y: 15 },
      { height: 10, width: 10, x: 3, y: 60 },
    ];

    // result
    expect(getLineTidyTargets(rects, false)).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 15 },
      { x: 3, y: 40 },
    ]);
  });
});
