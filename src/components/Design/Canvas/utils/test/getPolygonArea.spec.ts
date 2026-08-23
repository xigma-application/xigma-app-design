// utils
import { getPolygonArea } from '../getPolygonArea';

describe('getPolygonArea', () => {
  it('should compute the area of an axis-aligned rectangle', () => {
    // result
    expect(
      getPolygonArea([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 50 },
        { x: 0, y: 50 },
      ]),
    ).toBe(5000);
  });

  it('should return the same area regardless of winding direction (clockwise vs. counter-clockwise)', () => {
    // mock
    const clockwise = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const counterClockwise = [...clockwise].reverse();

    // result
    expect(getPolygonArea(clockwise)).toBe(getPolygonArea(counterClockwise));
  });

  it('should compute the area of a triangle via the shoelace formula', () => {
    // result
    expect(
      getPolygonArea([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 50, y: 100 },
      ]),
    ).toBe(5000);
  });

  it('should return 0 for a degenerate polygon with fewer than 3 distinct points', () => {
    // result
    expect(
      getPolygonArea([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
      ]),
    ).toBe(0);
  });
});
