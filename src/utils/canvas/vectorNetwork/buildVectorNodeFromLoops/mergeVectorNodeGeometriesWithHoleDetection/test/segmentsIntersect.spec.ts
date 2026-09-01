// utils
import { segmentsIntersect } from '../segmentsIntersect';

describe('segmentsIntersect', () => {
  it('should detect two segments genuinely crossing each other', () => {
    expect(segmentsIntersect({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 })).toBe(true);
  });

  it('should return false for parallel segments', () => {
    expect(segmentsIntersect({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 5 }, { x: 10, y: 5 })).toBe(false);
  });

  it('should return false for segments that only meet at an endpoint (T-junction), not a real crossing', () => {
    expect(segmentsIntersect({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 10 })).toBe(false);
  });

  it('should return false for segments that don’t come near each other', () => {
    expect(segmentsIntersect({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 100, y: 100 }, { x: 101, y: 101 })).toBe(false);
  });
});
