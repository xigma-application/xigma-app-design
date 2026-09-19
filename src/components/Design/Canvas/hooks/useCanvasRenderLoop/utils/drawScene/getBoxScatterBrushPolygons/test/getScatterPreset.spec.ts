// utils
import { getScatterPreset } from '../getScatterPreset';

describe('getScatterPreset', () => {
  it('should return the built-in preset without image stats', () => {
    // result
    expect(getScatterPreset(0, undefined)).toEqual({ aspect: 1, dotScale: 1, dots: 220, sigma: 0.22 });
  });

  it('should take the cloud sigma from the image stats, clamped', () => {
    // result
    expect(getScatterPreset(0, { coverage: 0.1, crossSigma: 0.2, dotRadiusRatio: 0.02 }).sigma).toBe(0.2);
    expect(getScatterPreset(0, { coverage: 0.1, crossSigma: 0.9, dotRadiusRatio: 0.02 }).sigma).toBe(0.28);
    expect(getScatterPreset(0, { coverage: 0.1, crossSigma: 0.01, dotRadiusRatio: 0.02 }).dots).toBe(220);
  });
});
