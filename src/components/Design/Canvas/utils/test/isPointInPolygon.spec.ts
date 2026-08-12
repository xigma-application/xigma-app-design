// utils
import { isPointInPolygon } from '../isPointInPolygon';

const diamond = { height: 10, sides: 4, width: 10, x: 0, y: 0 };

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
});
