// utils
import { hexToRgb } from '../hexToRgb';

describe('hexToRgb', () => {
  it('should convert a hex string with a leading # into its rgb channels', () => {
    expect(hexToRgb('#ff0000')).toEqual({ b: 0, g: 0, r: 255 });
  });

  it('should convert a hex string without a leading # into its rgb channels', () => {
    expect(hexToRgb('00ff00')).toEqual({ b: 0, g: 255, r: 0 });
  });

  it('should convert black and white correctly', () => {
    expect(hexToRgb('#000000')).toEqual({ b: 0, g: 0, r: 0 });
    expect(hexToRgb('#ffffff')).toEqual({ b: 255, g: 255, r: 255 });
  });
});
