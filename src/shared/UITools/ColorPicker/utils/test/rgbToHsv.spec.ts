// utils
import { rgbToHsv } from '../rgbToHsv';

describe('rgbToHsv', () => {
  it('should convert pure red', () => {
    expect(rgbToHsv({ b: 0, g: 0, r: 255 })).toEqual({ h: 0, s: 100, v: 100 });
  });

  it('should convert pure green', () => {
    expect(rgbToHsv({ b: 0, g: 255, r: 0 })).toEqual({ h: 120, s: 100, v: 100 });
  });

  it('should convert pure blue', () => {
    expect(rgbToHsv({ b: 255, g: 0, r: 0 })).toEqual({ h: 240, s: 100, v: 100 });
  });

  it('should convert white to zero saturation, full value', () => {
    expect(rgbToHsv({ b: 255, g: 255, r: 255 })).toEqual({ h: 0, s: 0, v: 100 });
  });

  it('should convert black to zero saturation, zero value', () => {
    expect(rgbToHsv({ b: 0, g: 0, r: 0 })).toEqual({ h: 0, s: 0, v: 0 });
  });
});
