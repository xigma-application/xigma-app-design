// utils
import { hexToHsv } from '../hexToHsv';

describe('hexToHsv', () => {
  it('should convert a hex string straight to hsv', () => {
    expect(hexToHsv('#ff0000')).toEqual({ h: 0, s: 100, v: 100 });
  });
});
