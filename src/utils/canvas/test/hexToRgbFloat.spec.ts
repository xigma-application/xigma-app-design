// utils
import { hexToRgbFloat } from '../hexToRgbFloat';

describe('hexToRgbFloat', () => {
  it('should convert black to [0, 0, 0]', () => {
    // result
    expect(hexToRgbFloat('#000000')).toEqual([0, 0, 0]);
  });

  it('should convert white to [1, 1, 1]', () => {
    // result
    expect(hexToRgbFloat('#ffffff')).toEqual([1, 1, 1]);
  });

  it('should convert an arbitrary hex color to normalized floats', () => {
    // result
    expect(hexToRgbFloat('#444444')).toEqual([68 / 255, 68 / 255, 68 / 255]);
  });
});
