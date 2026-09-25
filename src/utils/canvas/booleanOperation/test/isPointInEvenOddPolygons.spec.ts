// utils
import { isPointInEvenOddPolygons } from '../isPointInEvenOddPolygons';

const square = (x: number, y: number, size: number): { x: number; y: number }[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];

describe('isPointInEvenOddPolygons', () => {
  it('should be inside when an odd number of polygons contain the point', () => {
    // result
    expect(isPointInEvenOddPolygons({ x: 5, y: 5 }, [square(0, 0, 100)])).toBe(true);
  });

  it('should be outside inside a hole or outside every polygon', () => {
    // result
    expect(isPointInEvenOddPolygons({ x: 50, y: 50 }, [square(0, 0, 100), square(40, 40, 20)])).toBe(false);
    expect(isPointInEvenOddPolygons({ x: 500, y: 500 }, [square(0, 0, 100)])).toBe(false);
  });
});
