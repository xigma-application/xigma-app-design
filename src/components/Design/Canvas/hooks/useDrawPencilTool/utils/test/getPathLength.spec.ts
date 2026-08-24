// utils
import { getPathLength } from '../getPathLength';

describe('getPathLength', () => {
  it('should return 0 for an empty or single-point path', () => {
    // result
    expect(getPathLength([])).toBe(0);
    expect(getPathLength([{ x: 5, y: 5 }])).toBe(0);
  });

  it('should sum the distances between consecutive points', () => {
    // mock — a 3-4-5 right triangle leg, then a horizontal 4px leg
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 7, y: 4 },
    ];

    // result
    expect(getPathLength(points)).toBe(9);
  });

  it('should count distance traveled along a path that doubles back, not the net displacement', () => {
    // mock — goes 10px right, then 10px back left, ending where it started
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 0 },
    ];

    // result
    expect(getPathLength(points)).toBe(20);
  });
});
