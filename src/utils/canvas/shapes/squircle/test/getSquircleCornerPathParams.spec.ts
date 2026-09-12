// utils
import { getSquircleCornerPathParams } from '../getSquircleCornerPathParams';

describe('getSquircleCornerPathParams', () => {
  it('should degenerate to a plain circular arc when smoothing is 0', () => {
    // before
    const params = getSquircleCornerPathParams(10, 0, 100);

    // result
    expect(params.p).toBeCloseTo(10);
    expect(params.arcSectionLength).toBeCloseTo(10);
    expect(params.a).toBeCloseTo(0);
    expect(params.b).toBeCloseTo(0);
    expect(params.c).toBeCloseTo(0);
    expect(params.d).toBeCloseTo(0);
  });

  it('should shrink the arc and grow the bezier ramps as smoothing increases', () => {
    // before
    const params = getSquircleCornerPathParams(10, 1, 100);

    // result — full smoothing reaches for 2x the radius, well under the generous budget
    expect(params.p).toBeCloseTo(20);
    expect(params.arcSectionLength).toBeCloseTo(0);
    expect(params.a).toBeGreaterThan(0);
    expect(params.c).toBeGreaterThan(0);
    expect(params.d).toBeGreaterThan(0);
  });

  it('should clamp the reach and effective smoothing when the budget is too tight', () => {
    // before — budget only allows half the smoothing this radius would otherwise reach for
    const params = getSquircleCornerPathParams(10, 1, 15);

    // result
    expect(params.p).toBeCloseTo(15);
    // effective smoothing used internally is 0.5 (arcMeasure = 45deg)
    expect(params.arcSectionLength).toBeCloseTo(Math.sin((22.5 * Math.PI) / 180) * 10 * Math.sqrt(2));
  });
});
