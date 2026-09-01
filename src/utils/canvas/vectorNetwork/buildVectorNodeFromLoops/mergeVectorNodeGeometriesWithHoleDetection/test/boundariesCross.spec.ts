// types
import { TPoint } from 'types/canvas';

// utils
import { boundariesCross } from '../boundariesCross';

const square = (x: number, y: number, size: number): TPoint[] => [
  { x, y },
  { x: x + size, y },
  { x: x + size, y: y + size },
  { x, y: y + size },
];

describe('boundariesCross', () => {
  it('should return true when two polygons’ edges genuinely cross', () => {
    expect(boundariesCross(square(0, 0, 10), square(5, 5, 10))).toBe(true);
  });

  it('should return false for two disjoint polygons', () => {
    expect(boundariesCross(square(0, 0, 10), square(100, 100, 10))).toBe(false);
  });

  it('should return false when one polygon is fully nested inside another without their edges ever crossing', () => {
    expect(boundariesCross(square(0, 0, 100), square(20, 20, 10))).toBe(false);
  });
});
