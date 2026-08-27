// utils
import { rgbToCssString } from '../rgbToCssString';

describe('rgbToCssString', () => {
  it('should format rgba channels as an rgba() css string with alpha as a 0-1 fraction', () => {
    expect(rgbToCssString({ a: 100, b: 0, g: 128, r: 255 })).toBe('rgba(255, 128, 0, 1)');
  });

  it('should convert a partial alpha percentage into a 0-1 fraction', () => {
    expect(rgbToCssString({ a: 50, b: 0, g: 0, r: 0 })).toBe('rgba(0, 0, 0, 0.5)');
  });

  it('should convert zero alpha into 0', () => {
    expect(rgbToCssString({ a: 0, b: 0, g: 0, r: 0 })).toBe('rgba(0, 0, 0, 0)');
  });
});
