// utils
import { getHueDegrees } from '../getHueDegrees';

describe('getHueDegrees', () => {
  it('should return 0 for pure red', () => {
    expect(getHueDegrees({ b: 0, g: 0, r: 255 })).toBe(0);
  });

  it('should return 120 for pure green', () => {
    expect(getHueDegrees({ b: 0, g: 255, r: 0 })).toBe(120);
  });

  it('should return 240 for pure blue', () => {
    expect(getHueDegrees({ b: 255, g: 0, r: 0 })).toBe(240);
  });

  it('should return 0 for a gray with no chroma', () => {
    expect(getHueDegrees({ b: 128, g: 128, r: 128 })).toBe(0);
  });

  it('should wrap a negative hue back into the 0-360 range when red is max and blue exceeds green', () => {
    expect(getHueDegrees({ b: 100, g: 0, r: 255 })).toBeCloseTo(336.47, 1);
  });
});
