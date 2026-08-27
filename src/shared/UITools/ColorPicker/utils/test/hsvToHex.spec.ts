// utils
import { hsvToHex } from '../hsvToHex';

describe('hsvToHex', () => {
  it('should convert hsv straight to a hex string', () => {
    expect(hsvToHex({ h: 0, s: 100, v: 100 })).toBe('#ff0000');
  });
});
