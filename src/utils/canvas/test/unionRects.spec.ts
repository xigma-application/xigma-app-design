// utils
import { unionRects } from '../unionRects';

describe('unionRects', () => {
  it('should return the second rect unchanged when there is no accumulated rect yet', () => {
    const b = { height: 10, width: 10, x: 5, y: 5 };

    expect(unionRects(null, b)).toBe(b);
  });

  it('should union two overlapping rects into their bounding box', () => {
    const a = { height: 10, width: 10, x: 0, y: 0 };
    const b = { height: 10, width: 10, x: 5, y: 5 };

    expect(unionRects(a, b)).toEqual({ height: 15, width: 15, x: 0, y: 0 });
  });

  it('should account for each rect own width/height when finding the rightmost/bottommost edge, not just its x/y', () => {
    // a is far to the left with a small x but extends far right via its width; b sits entirely to
    // the right of a's own x but never reaches as far right as a's own right edge does
    const a = { height: 10, width: 200, x: -100, y: 0 };
    const b = { height: 10, width: 10, x: 50, y: 0 };

    expect(unionRects(a, b)).toEqual({ height: 10, width: 200, x: -100, y: 0 });
  });

  it('should union two disjoint rects into the smallest rect containing both, including the gap between them', () => {
    const a = { height: 10, width: 10, x: 0, y: 0 };
    const b = { height: 10, width: 10, x: 100, y: 100 };

    expect(unionRects(a, b)).toEqual({ height: 110, width: 110, x: 0, y: 0 });
  });
});
