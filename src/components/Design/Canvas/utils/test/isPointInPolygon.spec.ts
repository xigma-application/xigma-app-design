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

  it('should return false near a tip once cornerRadius cuts it off, even though the sharp shape includes that point', () => {
    // mock — the diamond's top vertex (5, 0) has a 90deg angle; radius 2's cutoff along the
    // bisector is 2*(sqrt(2)-1) =~ 0.83, so (5, 0.5) sits inside that cut-off zone
    const roundedDiamond = { ...diamond, cornerRadius: 2 };

    // result
    expect(isPointInPolygon({ x: 5, y: 0.5 }, diamond)).toBe(true);
    expect(isPointInPolygon({ x: 5, y: 0.5 }, roundedDiamond)).toBe(false);
  });

  it('should return true further from the tip, past the rounded cutoff', () => {
    // mock — (5, 1.5) is 1.5 from the vertex, beyond the ~0.83 cutoff for radius 2
    const roundedDiamond = { ...diamond, cornerRadius: 2 };

    // result
    expect(isPointInPolygon({ x: 5, y: 1.5 }, roundedDiamond)).toBe(true);
  });
});
