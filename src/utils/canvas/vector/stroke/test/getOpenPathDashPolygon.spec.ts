// types
import { StrokeDashCap } from 'types/design/enums';

// utils
import { buildOpenPolylineStrokeRing } from '../buildOpenPolylineStrokeRing';
import { getOpenPathDashPolygon } from '../getOpenPathDashPolygon';

const ring = buildOpenPolylineStrokeRing(
  [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ],
  1,
);

describe('getOpenPathDashPolygon', () => {
  it('should follow the path through a bend inside the dash', () => {
    // before
    const polygon = getOpenPathDashPolygon(ring, 5, 15, StrokeDashCap.none, 1);

    // result
    expect(polygon).toHaveLength(6);
    expect(polygon[1].x).toBeCloseTo(9);
    expect(polygon[1].y).toBeCloseTo(1);
  });

  it('should lengthen a square cap by the half width at both ends', () => {
    // before
    const none = getOpenPathDashPolygon(ring, 2, 4, StrokeDashCap.none, 1);
    const square = getOpenPathDashPolygon(ring, 2, 4, StrokeDashCap.square, 1);

    // result
    expect(Math.min(...square.map((point) => point.x))).toBeLessThan(Math.min(...none.map((point) => point.x)) - 0.5);
    expect(Math.max(...square.map((point) => point.x))).toBeGreaterThan(Math.max(...none.map((point) => point.x)) + 0.5);
  });

  it('should round a round cap at both ends', () => {
    // before
    const polygon = getOpenPathDashPolygon(ring, 2, 4, StrokeDashCap.round, 1);

    // result
    expect(polygon).toHaveLength(18);
    expect(Math.min(...polygon.map((point) => point.x))).toBeLessThan(1.5);
  });
});
