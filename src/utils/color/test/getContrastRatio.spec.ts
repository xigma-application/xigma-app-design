// utils
import { getContrastRatio } from '../getContrastRatio';

describe('getContrastRatio', () => {
  it('should return 21 for black against white', () => {
    expect(getContrastRatio({ b: 0, g: 0, r: 0 }, { b: 255, g: 255, r: 255 })).toBeCloseTo(21, 1);
  });

  it('should return 1 for a color against itself', () => {
    expect(getContrastRatio({ b: 128, g: 64, r: 200 }, { b: 128, g: 64, r: 200 })).toBeCloseTo(1, 5);
  });

  it('should be symmetric regardless of argument order', () => {
    const a = { b: 10, g: 200, r: 30 };
    const b = { b: 250, g: 250, r: 250 };

    expect(getContrastRatio(a, b)).toBeCloseTo(getContrastRatio(b, a), 10);
  });
});
