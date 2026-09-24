// utils
import { getPointSegmentDistance } from '../getPointSegmentDistance';

describe('getPointSegmentDistance', () => {
  it('should measure the perpendicular distance to the segment', () => {
    // action / result
    expect(getPointSegmentDistance({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(3);
  });

  it('should measure to the nearest end past the segment', () => {
    // action / result
    expect(getPointSegmentDistance({ x: 13, y: 4 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe(5);
  });

  it('should handle a zero-length segment', () => {
    // action / result
    expect(getPointSegmentDistance({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 })).toBe(5);
  });
});
