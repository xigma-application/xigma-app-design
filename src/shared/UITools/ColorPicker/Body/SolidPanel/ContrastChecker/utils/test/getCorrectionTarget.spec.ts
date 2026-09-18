// others
import { getContrastBoundaries } from '../getContrastBoundaries';
import { getContrastRatio } from 'utils/color/getContrastRatio';
import { getRelativeLuminance } from 'utils/color/getRelativeLuminance';
import { hexToRgb } from 'utils/color/hexToRgb';
import { hsvToRgb } from '../../../../../utils/hsvToRgb';
import { truncateContrastRatio } from 'utils/color/truncateContrastRatio';

// utils
import { getCorrectionTarget } from '../getCorrectionTarget';

const BACKGROUND = '#db0000';
const THRESHOLD = 4.5;

describe('getCorrectionTarget', () => {
  it('should return null when there are no boundaries', () => {
    expect(
      getCorrectionTarget({
        backgroundColor: BACKGROUND,
        boundaries: [],
        hsv: { h: 0, s: 50, v: 50 },
        isCorrectable: true,
        threshold: THRESHOLD,
      }),
    ).toBeNull();
  });

  it('should return a color that passes the threshold on the nearest boundary of a failing color', () => {
    const hsv = { h: 0, s: 40, v: 60 };
    const boundaries = getContrastBoundaries(hsv.h, getRelativeLuminance(hexToRgb(BACKGROUND)), THRESHOLD);

    const target = getCorrectionTarget({ backgroundColor: BACKGROUND, boundaries, hsv, isCorrectable: true, threshold: THRESHOLD })!;

    expect(target.h).toBe(hsv.h);
    expect(truncateContrastRatio(getContrastRatio(hsvToRgb(target), hexToRgb(BACKGROUND)))).toBeGreaterThanOrEqual(THRESHOLD);
  });

  it('should move the color no further than the same-saturation correction would', () => {
    const hsv = { h: 0, s: 40, v: 60 };
    const boundaries = getContrastBoundaries(hsv.h, getRelativeLuminance(hexToRgb(BACKGROUND)), THRESHOLD);

    const target = getCorrectionTarget({ backgroundColor: BACKGROUND, boundaries, hsv, isCorrectable: true, threshold: THRESHOLD })!;
    const distance = Math.hypot(target.s - hsv.s, target.v - hsv.v);

    expect(distance).toBeLessThan(100);
  });

  it('should return null when the color is not correctable', () => {
    const hsv = { h: 0, s: 40, v: 60 };
    const boundaries = getContrastBoundaries(hsv.h, getRelativeLuminance(hexToRgb(BACKGROUND)), THRESHOLD);

    expect(getCorrectionTarget({ backgroundColor: BACKGROUND, boundaries, hsv, isCorrectable: false, threshold: THRESHOLD })).toBeNull();
  });

  it('should return null when there is no background color', () => {
    const hsv = { h: 0, s: 40, v: 60 };
    const boundaries = getContrastBoundaries(hsv.h, getRelativeLuminance(hexToRgb(BACKGROUND)), THRESHOLD);

    expect(getCorrectionTarget({ backgroundColor: null, boundaries, hsv, isCorrectable: true, threshold: THRESHOLD })).toBeNull();
  });
});
