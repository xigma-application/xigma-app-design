// others
import { getRelativeLuminance } from 'utils/color/getRelativeLuminance';
import { hsvToRgb } from '../../../../../utils/hsvToRgb';

// utils
import { findVForLuminance } from '../findVForLuminance';

describe('findVForLuminance', () => {
  it('should find v=100 (within tolerance) when the target is the maximum achievable luminance', () => {
    const maxLuminance = getRelativeLuminance(hsvToRgb({ h: 0, s: 100, v: 100 }));
    const v = findVForLuminance(0, 100, maxLuminance)!;

    expect(v).toBeCloseTo(100, 0);
  });

  it('should find v=0 for a target luminance of 0 (black)', () => {
    const v = findVForLuminance(120, 50, 0)!;

    expect(v).toBeCloseTo(0, 0);
  });

  it('should return a v whose actual luminance matches the requested target closely', () => {
    const hue = 0;
    const saturation = 100;
    const targetLuminance = 0.1;
    const v = findVForLuminance(hue, saturation, targetLuminance)!;
    const actualLuminance = getRelativeLuminance(hsvToRgb({ h: hue, s: saturation, v }));

    // loose tolerance: hsvToRgb quantizes each channel to an 8-bit integer, so exact luminance
    // matching isn't possible — this only checks the search converged to the right neighborhood
    expect(actualLuminance).toBeCloseTo(targetLuminance, 2);
  });

  it('should return null when the target luminance exceeds what this hue/saturation column can ever reach', () => {
    // fully saturated blue's max luminance (v=100) is far below 1, since blue is weighted only 0.0722
    expect(findVForLuminance(240, 100, 0.9)).toBeNull();
  });

  it('should return null for a negative target luminance', () => {
    expect(findVForLuminance(0, 100, -0.1)).toBeNull();
  });
});
