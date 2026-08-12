// utils
import { isPointNearLine } from '../isPointNearLine';

const line = { x1: 0, x2: 10, y1: 0, y2: 0 };

describe('isPointNearLine', () => {
  it('should return true for a point directly on the segment', () => {
    // result
    expect(isPointNearLine({ x: 5, y: 0 }, line, 1)).toBe(true);
  });

  it('should return true for a point within tolerance of the segment', () => {
    // result
    expect(isPointNearLine({ x: 5, y: 0.5 }, line, 1)).toBe(true);
  });

  it('should return false for a point beyond tolerance of the segment', () => {
    // result
    expect(isPointNearLine({ x: 5, y: 5 }, line, 1)).toBe(false);
  });

  it('should measure distance to the nearest endpoint, not the infinite line, past either end', () => {
    // result — (15, 0) is 5 units past the (10, 0) endpoint, well outside a tolerance of 1
    expect(isPointNearLine({ x: 15, y: 0 }, line, 1)).toBe(false);
  });

  it('should account for the segment angle rather than treating it as a bounding box', () => {
    // mock
    const diagonal = { x1: 0, x2: 10, y1: 0, y2: 10 };

    // result — (0, 10) sits inside the diagonal's bounding box but far from the diagonal itself
    expect(isPointNearLine({ x: 0, y: 10 }, diagonal, 1)).toBe(false);
  });

  it('should treat a zero-length segment as a point', () => {
    // mock
    const point = { x1: 5, x2: 5, y1: 5, y2: 5 };

    // result
    expect(isPointNearLine({ x: 5, y: 5.5 }, point, 1)).toBe(true);
    expect(isPointNearLine({ x: 5, y: 8 }, point, 1)).toBe(false);
  });
});
