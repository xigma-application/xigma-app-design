// utils
import { getLineQuadPoints } from '../getLineQuadPoints';

describe('getLineQuadPoints', () => {
  it('should return a 4-point quad offset perpendicular to the line by half the stroke width', () => {
    // action
    const points = getLineQuadPoints({ x1: 0, x2: 10, y1: 0, y2: 0 }, 4);

    // result
    expect(points).toEqual([
      { x: 0, y: 2 },
      { x: 10, y: 2 },
      { x: 10, y: -2 },
      { x: 0, y: -2 },
    ]);
  });

  it('should return an empty polygon for a zero-length line', () => {
    // action
    const points = getLineQuadPoints({ x1: 5, x2: 5, y1: 5, y2: 5 }, 4);

    // result
    expect(points).toEqual([]);
  });
});
