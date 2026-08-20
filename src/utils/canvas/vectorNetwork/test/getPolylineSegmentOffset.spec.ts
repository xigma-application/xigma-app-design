// utils
import { getPolylineSegmentOffset } from '../getPolylineSegmentOffset';

describe('getPolylineSegmentOffset', () => {
  it('should return the perpendicular offset, scaled to halfWidth, for a horizontal segment', () => {
    // before
    const offset = getPolylineSegmentOffset({ x: 0, y: 0 }, { x: 10, y: 0 }, 2);

    // result — toBeCloseTo on x, not toEqual: -dy/length can come out as a floating-point -0
    expect(offset?.x).toBeCloseTo(0);
    expect(offset?.y).toBe(2);
  });

  it('should return the perpendicular offset, scaled to halfWidth, for a vertical segment', () => {
    // result
    expect(getPolylineSegmentOffset({ x: 0, y: 0 }, { x: 0, y: 10 }, 2)).toEqual({ x: -2, y: 0 });
  });

  it('should return null for a zero-length segment', () => {
    // result
    expect(getPolylineSegmentOffset({ x: 5, y: 5 }, { x: 5, y: 5 }, 2)).toBeNull();
  });
});
