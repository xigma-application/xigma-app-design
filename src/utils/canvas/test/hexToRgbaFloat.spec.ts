// utils
import { hexToRgbaFloat } from '../hexToRgbaFloat';

describe('hexToRgbaFloat', () => {
  it('should default alpha to 1', () => {
    // result
    expect(hexToRgbaFloat('#ffffff')).toEqual([1, 1, 1, 1]);
  });

  it('should use the given alpha', () => {
    // result
    expect(hexToRgbaFloat('#000000', 0.2)).toEqual([0, 0, 0, 0.2]);
  });
});
