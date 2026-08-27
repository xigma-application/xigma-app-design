// utils
import { hsvToRgb } from '../hsvToRgb';

describe('hsvToRgb', () => {
  it('should convert hue 0 full saturation/value to pure red', () => {
    expect(hsvToRgb({ h: 0, s: 100, v: 100 })).toEqual({ b: 0, g: 0, r: 255 });
  });

  it('should convert hue 120 full saturation/value to pure green', () => {
    expect(hsvToRgb({ h: 120, s: 100, v: 100 })).toEqual({ b: 0, g: 255, r: 0 });
  });

  it('should convert hue 240 full saturation/value to pure blue', () => {
    expect(hsvToRgb({ h: 240, s: 100, v: 100 })).toEqual({ b: 255, g: 0, r: 0 });
  });

  it('should convert zero saturation to a gray regardless of hue', () => {
    expect(hsvToRgb({ h: 200, s: 0, v: 100 })).toEqual({ b: 255, g: 255, r: 255 });
  });

  it('should convert zero value to black regardless of hue/saturation', () => {
    expect(hsvToRgb({ h: 200, s: 100, v: 0 })).toEqual({ b: 0, g: 0, r: 0 });
  });
});
