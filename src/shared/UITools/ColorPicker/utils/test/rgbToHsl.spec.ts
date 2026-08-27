// utils
import { rgbToHsl } from '../rgbToHsl';

describe('rgbToHsl', () => {
  it('should convert pure red to 50% lightness, full saturation', () => {
    expect(rgbToHsl({ b: 0, g: 0, r: 255 })).toEqual({ h: 0, l: 50, s: 100 });
  });

  it('should convert white to zero saturation, full lightness', () => {
    expect(rgbToHsl({ b: 255, g: 255, r: 255 })).toEqual({ h: 0, l: 100, s: 0 });
  });

  it('should convert black to zero saturation, zero lightness', () => {
    expect(rgbToHsl({ b: 0, g: 0, r: 0 })).toEqual({ h: 0, l: 0, s: 0 });
  });
});
