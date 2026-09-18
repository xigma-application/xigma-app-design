// others
import { getContrastRatio } from 'utils/color/getContrastRatio';
import { hsvToRgb } from '../../../../../utils/hsvToRgb';

// utils
import { getNearestPassingHsv } from '../getNearestPassingHsv';

describe('getNearestPassingHsv', () => {
  it('should darken a too-light color against a light (white) background until it just passes', () => {
    const whiteLuminance = 1;
    const targetRatio = 4.5;
    const hsv = { h: 0, s: 100, v: 90 };

    const corrected = getNearestPassingHsv(hsv, whiteLuminance, targetRatio)!;
    const ratio = getContrastRatio(hsvToRgb(corrected), { b: 255, g: 255, r: 255 });

    expect(corrected.h).toBe(hsv.h);
    expect(corrected.s).toBe(hsv.s);
    expect(ratio).toBeGreaterThanOrEqual(targetRatio - 0.05);
  });

  it('should lighten a too-dark color against a dark (black) background until it just passes', () => {
    const blackLuminance = 0;
    const targetRatio = 4.5;
    const hsv = { h: 0, s: 100, v: 10 };

    const corrected = getNearestPassingHsv(hsv, blackLuminance, targetRatio)!;
    const ratio = getContrastRatio(hsvToRgb(corrected), { b: 0, g: 0, r: 0 });

    expect(ratio).toBeGreaterThanOrEqual(targetRatio - 0.05);
  });

  it('should pick whichever of the two passing directions is closer to the current value', () => {
    // against a mid-gray background both a much-lighter and a much-darker color can pass;
    // starting close to white should correct toward lighter, not jump all the way down to dark
    const midGrayLuminance = 0.18;
    const targetRatio = 3;
    const hsv = { h: 0, s: 20, v: 95 };

    const corrected = getNearestPassingHsv(hsv, midGrayLuminance, targetRatio)!;

    expect(corrected.v).toBeGreaterThan(hsv.v - 5);
  });

  it('should return null when no v at this hue/saturation can ever pass', () => {
    // fully saturated blue's max achievable luminance is too low to ever reach 21:1 against a
    // mid-gray background from either direction
    const result = getNearestPassingHsv({ h: 240, s: 100, v: 50 }, 0.18, 21);

    expect(result).toBeNull();
  });
});
