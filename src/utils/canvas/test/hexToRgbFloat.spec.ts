// utils
import { hexToRgbFloat } from '../hexToRgbFloat';
import { setActiveColorProfile } from '../activeColorProfile';

describe('hexToRgbFloat', () => {
  afterEach(() => {
    setActiveColorProfile('srgb');
  });

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

  it('should leave the color as plain sRGB floats when the active color profile is srgb', () => {
    // mock
    setActiveColorProfile('srgb');

    // result
    expect(hexToRgbFloat('#ff0000')).toEqual([1, 0, 0]);
  });

  it('should convert the color into Display P3 floats when the active color profile is displayP3', () => {
    // mock
    setActiveColorProfile('displayP3');

    // action
    const [r, g, b] = hexToRgbFloat('#ff0000');

    // result — matches convertSrgbToDisplayP3's own reference-value test for srgb(1 0 0)
    expect(r).toBeCloseTo(0.91749, 3);
    expect(g).toBeCloseTo(0.20028, 3);
    expect(b).toBeCloseTo(0.13862, 3);
  });
});
