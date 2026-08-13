// utils
import { isPointInPolygon } from '../isPointInPolygon';

const diamond = { flipX: false, flipY: false, height: 10, sides: 4, width: 10, x: 0, y: 0 };

describe('isPointInPolygon', () => {
  it('should return true for the center point', () => {
    // result
    expect(isPointInPolygon({ x: 5, y: 5 }, diamond)).toBe(true);
  });

  it('should return true for a point inside the polygon near an edge', () => {
    // result
    expect(isPointInPolygon({ x: 7, y: 5 }, diamond)).toBe(true);
  });

  it('should return false for a point outside the polygon but inside its bounding box', () => {
    // result — the (0, 0) corner of the bounding rect sits outside the diamond inscribed in it
    expect(isPointInPolygon({ x: 0, y: 0 }, diamond)).toBe(false);
  });

  it('should return false for a point far outside the polygon', () => {
    // result
    expect(isPointInPolygon({ x: 100, y: 100 }, diamond)).toBe(false);
  });

  it('should test against the actually mirrored geometry for an asymmetric (odd-sided) polygon', () => {
    // mock — a triangle (apex at top, y=0; base at the bottom, y=7.5) is not symmetric under a
    const triangle = { flipX: false, flipY: false, height: 10, sides: 3, width: 10, x: 0, y: 0 };
    const flippedTriangle = { ...triangle, flipY: true };

    // result — (5, 0.5) sits just below the unflipped apex (inside); once flipY mirrors the
    expect(isPointInPolygon({ x: 5, y: 0.5 }, triangle)).toBe(true);
    expect(isPointInPolygon({ x: 5, y: 0.5 }, flippedTriangle)).toBe(false);
    expect(isPointInPolygon({ x: 5, y: 9.5 }, triangle)).toBe(false);
    expect(isPointInPolygon({ x: 5, y: 9.5 }, flippedTriangle)).toBe(true);
  });
});
