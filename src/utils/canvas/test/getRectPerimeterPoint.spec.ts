// utils
import { getRectPerimeterPoint } from '../getRectPerimeterPoint';

const RECT = { height: 20, width: 10, x: 5, y: 5 };

describe('getRectPerimeterPoint', () => {
  it('should return the top-left corner at distance 0', () => {
    // result
    expect(getRectPerimeterPoint(RECT, 0)).toEqual({ x: 5, y: 5 });
  });

  it('should walk along the top edge for a distance within its length', () => {
    // result
    expect(getRectPerimeterPoint(RECT, 4)).toEqual({ x: 9, y: 5 });
  });

  it('should walk along the right edge once the distance exceeds the top edge', () => {
    // result — top edge (10) + 4 down the right edge
    expect(getRectPerimeterPoint(RECT, 14)).toEqual({ x: 15, y: 9 });
  });

  it('should walk along the bottom edge, moving right-to-left back toward the origin x', () => {
    // result — top (10) + right (20) + 4 along the bottom edge
    expect(getRectPerimeterPoint(RECT, 34)).toEqual({ x: 11, y: 25 });
  });

  it('should walk along the left edge, moving bottom-to-top back toward the origin y', () => {
    // result — top (10) + right (20) + bottom (10) + 4 up the left edge
    expect(getRectPerimeterPoint(RECT, 44)).toEqual({ x: 5, y: 21 });
  });

  it('should wrap back to the top-left corner at a full perimeter distance', () => {
    // result — perimeter = 2 * (10 + 20) = 60
    expect(getRectPerimeterPoint(RECT, 60)).toEqual({ x: 5, y: 5 });
  });

  it('should fall back to the top-left corner for a distance past the full perimeter', () => {
    // result — perimeter = 60; a caller passing a distance beyond that is out of range
    expect(getRectPerimeterPoint(RECT, 61)).toEqual({ x: 5, y: 5 });
  });

  it('should not divide by zero on a degenerate (zero-width) rect', () => {
    // mock — a flat, zero-width rect: its top edge has length 0
    const flatRect = { height: 10, width: 0, x: 0, y: 0 };

    // result — querying its zero-length top edge must not produce NaN
    expect(getRectPerimeterPoint(flatRect, 0)).toEqual({ x: 0, y: 0 });
  });
});
