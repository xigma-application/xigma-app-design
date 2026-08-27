// utils
import { hslToRgb } from '../hslToRgb';

describe('hslToRgb', () => {
  it('should convert hue 0, full saturation, 50% lightness to pure red', () => {
    expect(hslToRgb({ h: 0, l: 50, s: 100 })).toEqual({ b: 0, g: 0, r: 255 });
  });

  it('should convert zero saturation to a gray at the given lightness', () => {
    expect(hslToRgb({ h: 200, l: 100, s: 0 })).toEqual({ b: 255, g: 255, r: 255 });
  });

  it('should convert zero lightness to black regardless of hue/saturation', () => {
    expect(hslToRgb({ h: 200, l: 0, s: 100 })).toEqual({ b: 0, g: 0, r: 0 });
  });
});
