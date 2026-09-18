// utils
import { hsvToRgbFloat } from '../hsvToRgbFloat';

describe('hsvToRgbFloat', () => {
  it('should convert pure red without rounding', () => {
    expect(hsvToRgbFloat({ h: 0, s: 100, v: 100 })).toEqual({ b: 0, g: 0, r: 255 });
  });

  it('should keep fractional channel values instead of rounding to 8 bits', () => {
    const { r } = hsvToRgbFloat({ h: 0, s: 0, v: 50.1 });

    expect(r).toBeCloseTo(127.755, 3);
  });
});
