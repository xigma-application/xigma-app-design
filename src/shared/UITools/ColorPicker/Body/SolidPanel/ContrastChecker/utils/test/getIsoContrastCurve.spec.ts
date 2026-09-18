// others
import { getRelativeLuminance } from 'utils/color/getRelativeLuminance';
import { hsvToRgb } from '../../../../../utils/hsvToRgb';

// utils
import { getIsoContrastCurve } from '../getIsoContrastCurve';

describe('getIsoContrastCurve', () => {
  it('should return one point per achievable saturation sample, each matching the target luminance', () => {
    const hue = 0;
    const targetLuminance = 0.2;
    const points = getIsoContrastCurve(hue, targetLuminance);

    expect(points.length).toBeGreaterThan(0);

    points.forEach(({ s, v }) => {
      const actualLuminance = getRelativeLuminance(hsvToRgb({ h: hue, s, v }));

      expect(actualLuminance).toBeCloseTo(targetLuminance, 2);
    });
  });

  it('should span saturation from 0 to 100 when the target is achievable everywhere', () => {
    const points = getIsoContrastCurve(0, 0.2);
    const saturations = points.map((point) => point.s);

    expect(Math.min(...saturations)).toBeCloseTo(0, 5);
    expect(Math.max(...saturations)).toBeCloseTo(100, 5);
  });

  it('should stop short of full saturation for a hue whose fully-saturated form cannot reach the target', () => {
    // blue's fully-saturated luminance is far below 0.95 (only s=0, i.e. white, reaches it), so the
    // curve must not include a point at s=100 the way it does for a fully achievable target
    const points = getIsoContrastCurve(240, 0.95);
    const saturations = points.map((point) => point.s);

    expect(saturations).not.toContain(100);
  });

  it('should return v=0 for every sample when the target luminance is 0', () => {
    const points = getIsoContrastCurve(90, 0);

    expect(points.length).toBeGreaterThan(0);
    points.forEach(({ v }) => expect(v).toBeCloseTo(0, 0));
  });
});
