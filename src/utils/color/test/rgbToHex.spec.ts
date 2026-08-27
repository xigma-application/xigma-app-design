// utils
import { rgbToHex } from '../rgbToHex';

describe('rgbToHex', () => {
  it('should convert rgb channels into a lowercase hex string with a leading #', () => {
    expect(rgbToHex({ b: 0, g: 0, r: 255 })).toBe('#ff0000');
  });

  it('should pad single-digit hex channels with a leading zero', () => {
    expect(rgbToHex({ b: 1, g: 2, r: 3 })).toBe('#030201');
  });

  it('should round fractional channel values before converting', () => {
    expect(rgbToHex({ b: 0, g: 0, r: 254.6 })).toBe('#ff0000');
  });
});
