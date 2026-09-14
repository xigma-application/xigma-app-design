// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientEllipseNormalDirection } from '../getGradientEllipseNormalDirection';
import { getGradientEllipsePoint } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawGradientHandleLayer/getGradientEllipsePoint';
import { getGradientRadialOutwardDirection } from '../getGradientRadialOutwardDirection';

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

const CIRCULAR_PAINT: TGradientPaint = {
  end: { x: 0.5, y: 1 },
  opacity: 100,
  start: { x: 0.5, y: 0.5 },
  stops: [],
  type: 'gradient-angular',
};

describe('getGradientEllipseNormalDirection', () => {
  it('should point straight down at the primary axis endpoint (position 0), same as the naive radial direction', () => {
    // before
    const direction = getGradientEllipseNormalDirection(BOUNDS, 0, CIRCULAR_PAINT, 0);

    // result — at an axis vertex the true curve normal and the "vector from center" coincide
    expect(direction.x).toBeCloseTo(0, 5);
    expect(direction.y).toBeCloseTo(1, 5);
  });

  it('should point straight left at the perpendicular radius-handle point (position 0.25), same as the naive radial direction', () => {
    // before
    const direction = getGradientEllipseNormalDirection(BOUNDS, 0, CIRCULAR_PAINT, 0.25);

    // result
    expect(direction.x).toBeCloseTo(-1, 5);
    expect(direction.y).toBeCloseTo(0, 5);
  });

  it('should match the naive radial direction everywhere on a perfect circle (square node, radiusRatio 1)', () => {
    // before — a circle's radius is always perpendicular to its own tangent, at every angle, not just
    // the 4 axis vertices, so the two approaches must agree everywhere in this specific case
    for (const position of [0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9]) {
      const normalDirection = getGradientEllipseNormalDirection(BOUNDS, 0, CIRCULAR_PAINT, position);
      const ellipsePoint = getGradientEllipsePoint(BOUNDS, 0, CIRCULAR_PAINT, position);
      const radialDirection = getGradientRadialOutwardDirection(ellipsePoint, { x: 50, y: 50 });

      expect(normalDirection.x).toBeCloseTo(radialDirection.x, 4);
      expect(normalDirection.y).toBeCloseTo(radialDirection.y, 4);
    }
  });

  it('should diverge from the naive radial direction for a genuinely elliptical gradient (radiusRatio !== 1)', () => {
    // before — a stretched perpendicular axis makes the curve's own normal differ from "away from
    // center" everywhere except the 4 axis vertices
    const ellipticalPaint: TGradientPaint = { ...CIRCULAR_PAINT, radiusRatio: 2 };
    const normalDirection = getGradientEllipseNormalDirection(BOUNDS, 0, ellipticalPaint, 0.125);

    // result — the naive radial direction at this point would be (-0.8944, 0.4472); the true normal
    // tilts noticeably away from it
    expect(normalDirection.x).not.toBeCloseTo(-0.8944, 2);
    expect(normalDirection.y).not.toBeCloseTo(0.4472, 2);

    // it still stays a unit vector, pointing generally outward (away from the center)
    expect(Math.hypot(normalDirection.x, normalDirection.y)).toBeCloseTo(1, 5);
  });

  it('should account for a rotated node', () => {
    // before — rotating the whole node 90deg should rotate the normal the same way
    const unrotated = getGradientEllipseNormalDirection(BOUNDS, 0, CIRCULAR_PAINT, 0);
    const rotated = getGradientEllipseNormalDirection(BOUNDS, 90, CIRCULAR_PAINT, 0);

    expect(rotated.x).toBeCloseTo(-unrotated.y, 5);
    expect(rotated.y).toBeCloseTo(unrotated.x, 5);
  });

  it('should fall back to pointing up when the primary axis has zero length', () => {
    const degeneratePaint: TGradientPaint = { ...CIRCULAR_PAINT, end: { ...CIRCULAR_PAINT.start } };

    expect(getGradientEllipseNormalDirection(BOUNDS, 0, degeneratePaint, 0.3)).toEqual({ x: 0, y: -1 });
  });
});
