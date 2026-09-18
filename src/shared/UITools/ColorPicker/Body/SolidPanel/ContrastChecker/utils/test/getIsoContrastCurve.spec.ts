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

  it('should clamp columns whose target luminance is unreachable to the top edge (v=100), so the curve spans the full width', () => {
    // blue's fully-saturated luminance is far below 0.95, so those columns can never reach it
    const points = getIsoContrastCurve(240, 0.95);
    const last = points[points.length - 1];

    expect(last.s).toBe(100);
    expect(last.v).toBe(100);
  });

  it('should return v=0 for every sample when the target luminance is 0', () => {
    const points = getIsoContrastCurve(90, 0);

    expect(points.length).toBeGreaterThan(0);
    points.forEach(({ v }) => expect(v).toBeCloseTo(0, 0));
  });

  it('should produce a smooth, monotonic curve with no 8-bit rounding jitter', () => {
    const points = getIsoContrastCurve(0, 0.06).filter((point) => point.v < 100);
    const deltas = points.slice(1).map((point, index) => point.v - points[index].v);

    expect(points.length).toBeGreaterThan(10);
    expect(deltas.every((delta) => delta >= -1e-9) || deltas.every((delta) => delta <= 1e-9)).toBe(true);
  });
});
