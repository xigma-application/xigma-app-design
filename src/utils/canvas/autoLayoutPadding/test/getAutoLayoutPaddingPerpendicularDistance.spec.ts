// utils
import { getAutoLayoutPaddingPerpendicularDistance } from '../getAutoLayoutPaddingPerpendicularDistance';

const handleCenter = { x: 10, y: 100 };

describe('getAutoLayoutPaddingPerpendicularDistance', () => {
  it('should measure the vertical distance from the handle centre for a left/right side', () => {
    // result
    expect(getAutoLayoutPaddingPerpendicularDistance('left', { x: 10, y: 108 }, handleCenter)).toBe(8);
    expect(getAutoLayoutPaddingPerpendicularDistance('right', { x: 10, y: 92 }, handleCenter)).toBe(8);
  });

  it('should measure the horizontal distance from the handle centre for a top/bottom side', () => {
    // result
    expect(getAutoLayoutPaddingPerpendicularDistance('top', { x: 18, y: 100 }, handleCenter)).toBe(8);
    expect(getAutoLayoutPaddingPerpendicularDistance('bottom', { x: 2, y: 100 }, handleCenter)).toBe(8);
  });
});
