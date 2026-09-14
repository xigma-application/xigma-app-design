// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientEllipseNormalizedPoint } from '../getGradientEllipseNormalizedPoint';

const PAINT: TGradientPaint = {
  end: { x: 0.5, y: 1 },
  opacity: 100,
  start: { x: 0.5, y: 0.5 },
  stops: [],
  type: 'gradient-angular',
};

describe('getGradientEllipseNormalizedPoint', () => {
  it('should place position 0 exactly at the primary axis endpoint', () => {
    // before
    const point = getGradientEllipseNormalizedPoint(PAINT, 0);

    // result
    expect(point.x).toBeCloseTo(0.5, 5);
    expect(point.y).toBeCloseTo(1, 5);
  });

  it('should place position 1 at the same point as position 0 — a full turn wraps back', () => {
    // before
    const point = getGradientEllipseNormalizedPoint(PAINT, 1);

    // result
    expect(point.x).toBeCloseTo(0.5, 5);
    expect(point.y).toBeCloseTo(1, 5);
  });

  it('should place position 0.5 on the opposite side of the center from the primary axis endpoint', () => {
    // before
    const point = getGradientEllipseNormalizedPoint(PAINT, 0.5);

    // result
    expect(point.x).toBeCloseTo(0.5, 5);
    expect(point.y).toBeCloseTo(0, 5);
  });

  it('should place position 0.25 at the radiusRatio-scaled radius handle point', () => {
    // before
    const point = getGradientEllipseNormalizedPoint({ ...PAINT, radiusRatio: 0.5 }, 0.25);

    // result — primary radius 0.5, radiusRatio 0.5 -> secondary radius 0.25, perpendicular to (0,1) is (-1,0)
    expect(point.x).toBeCloseTo(0.25, 5);
    expect(point.y).toBeCloseTo(0.5, 5);
  });

  it('should fall back to start when the primary axis has zero length', () => {
    // before
    const point = getGradientEllipseNormalizedPoint({ ...PAINT, end: { ...PAINT.start } }, 0.3);

    // result
    expect(point).toEqual(PAINT.start);
  });
});
