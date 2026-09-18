// utils
import { getRelativeLuminance } from '../getRelativeLuminance';

describe('getRelativeLuminance', () => {
  it('should return 0 for black', () => {
    expect(getRelativeLuminance({ b: 0, g: 0, r: 0 })).toBe(0);
  });

  it('should return 1 for white', () => {
    expect(getRelativeLuminance({ b: 255, g: 255, r: 255 })).toBeCloseTo(1, 5);
  });

  it('should weight green the heaviest and blue the lightest', () => {
    const red = getRelativeLuminance({ b: 0, g: 0, r: 255 });
    const green = getRelativeLuminance({ b: 0, g: 255, r: 0 });
    const blue = getRelativeLuminance({ b: 255, g: 0, r: 0 });

    expect(green).toBeGreaterThan(red);
    expect(red).toBeGreaterThan(blue);
  });

  it('should match the WCAG worked example for medium gray (#808080)', () => {
    // 128/255 = 0.50196 -> linearized ~0.21586, luminance = 0.21586 (equal across channels)
    expect(getRelativeLuminance({ b: 128, g: 128, r: 128 })).toBeCloseTo(0.21586, 4);
  });
});
