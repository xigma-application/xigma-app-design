// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientRadiusHandleNormalizedPoint } from '../getGradientRadiusHandleNormalizedPoint';

const basePaint: TGradientPaint = {
  end: { x: 1, y: 0.5 },
  opacity: 100,
  start: { x: 0, y: 0.5 },
  stops: [],
  type: 'gradient-radial',
};

describe('getGradientRadiusHandleNormalizedPoint', () => {
  it('should sit one primary-radius away, perpendicular to start->end, when radiusRatio is default (1)', () => {
    const point = getGradientRadiusHandleNormalizedPoint(basePaint);

    expect(point.x).toBeCloseTo(0, 5);
    expect(point.y).toBeCloseTo(1.5, 5);
  });

  it('should scale the perpendicular distance by radiusRatio', () => {
    const point = getGradientRadiusHandleNormalizedPoint({ ...basePaint, radiusRatio: 0.4 });

    expect(point.x).toBeCloseTo(0, 5);
    expect(point.y).toBeCloseTo(0.9, 5);
  });

  it('should work for a diagonal start->end axis', () => {
    const point = getGradientRadiusHandleNormalizedPoint({ ...basePaint, end: { x: 1, y: 1 }, start: { x: 0, y: 0 } });

    expect(point.x).toBeCloseTo(-1, 5);
    expect(point.y).toBeCloseTo(1, 5);
  });

  it('should fall back to the center point when start and end coincide', () => {
    const point = getGradientRadiusHandleNormalizedPoint({ ...basePaint, end: { x: 0.3, y: 0.5 }, start: { x: 0.3, y: 0.5 } });

    expect(point).toEqual({ x: 0.3, y: 0.5 });
  });
});
