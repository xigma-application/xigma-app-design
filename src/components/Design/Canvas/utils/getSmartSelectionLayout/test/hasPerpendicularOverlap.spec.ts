// utils
import { hasPerpendicularOverlap } from '../hasPerpendicularOverlap';

describe('hasPerpendicularOverlap', () => {
  it('should be true for two horizontally-adjacent rects sharing a vertical band', () => {
    expect(hasPerpendicularOverlap({ height: 100, width: 50, x: 0, y: 0 }, { height: 100, width: 50, x: 200, y: 10 }, 'x')).toBe(true);
  });

  it('should be false for two horizontally-adjacent rects with no vertical overlap', () => {
    expect(hasPerpendicularOverlap({ height: 100, width: 50, x: 0, y: 0 }, { height: 100, width: 50, x: 200, y: 100 }, 'x')).toBe(false);
  });

  it('should be true for two vertically-adjacent rects sharing a horizontal band', () => {
    expect(hasPerpendicularOverlap({ height: 50, width: 100, x: 0, y: 0 }, { height: 50, width: 100, x: 10, y: 200 }, 'y')).toBe(true);
  });

  it('should be false for two vertically-adjacent rects with no horizontal overlap', () => {
    expect(hasPerpendicularOverlap({ height: 50, width: 100, x: 0, y: 0 }, { height: 50, width: 100, x: 100, y: 200 }, 'y')).toBe(false);
  });
});
