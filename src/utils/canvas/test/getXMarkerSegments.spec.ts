// utils
import { getXMarkerSegments } from '../getXMarkerSegments';

describe('getXMarkerSegments', () => {
  it('should return the two diagonals of a square around the center', () => {
    // before
    const segments = getXMarkerSegments({ x: 10, y: 20 }, 3);

    // result
    expect(segments).toEqual([
      { x1: 7, x2: 13, y1: 17, y2: 23 },
      { x1: 7, x2: 13, y1: 23, y2: 17 },
    ]);
  });
});
