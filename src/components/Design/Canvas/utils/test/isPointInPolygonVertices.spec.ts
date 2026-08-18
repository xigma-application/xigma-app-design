// utils
import { isPointInPolygonVertices } from '../isPointInPolygonVertices';

const SQUARE = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
];
const TRIANGLE = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 5, y: 10 },
];

describe('isPointInPolygonVertices', () => {
  it('should return true for a point inside a simple square', () => {
    // result
    expect(isPointInPolygonVertices({ x: 5, y: 5 }, SQUARE)).toBe(true);
  });

  it('should return false for a point outside a simple square', () => {
    // result
    expect(isPointInPolygonVertices({ x: 15, y: 5 }, SQUARE)).toBe(false);
  });

  it('should return false for a point above the polygon entirely, where no edge crosses its ray', () => {
    // result
    expect(isPointInPolygonVertices({ x: 5, y: 20 }, SQUARE)).toBe(false);
  });

  it('should return true for a point inside a triangle', () => {
    // result
    expect(isPointInPolygonVertices({ x: 5, y: 3 }, TRIANGLE)).toBe(true);
  });

  it('should return false for a point outside a triangle but within its bounding box', () => {
    // result
    expect(isPointInPolygonVertices({ x: 1, y: 9 }, TRIANGLE)).toBe(false);
  });
});
