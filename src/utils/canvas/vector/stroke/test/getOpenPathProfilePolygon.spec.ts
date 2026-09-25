// types
import { StrokeProfile } from 'types/design/enums';

// utils
import { buildOpenPolylineStrokeRing } from '../buildOpenPolylineStrokeRing';
import { getOpenPathProfilePolygon } from '../getOpenPathProfilePolygon';

const ring = buildOpenPolylineStrokeRing(
  [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
  ],
  5,
);

describe('getOpenPathProfilePolygon', () => {
  it('should narrow a wedge to a point at the end of the path', () => {
    // before
    const polygon = getOpenPathProfilePolygon(ring, StrokeProfile.wedge, false);
    const half = polygon.length / 2;
    const endWidths = [
      Math.hypot(polygon[0].x - polygon[polygon.length - 1].x, polygon[0].y - polygon[polygon.length - 1].y),
      Math.hypot(polygon[half - 1].x - polygon[half].x, polygon[half - 1].y - polygon[half].y),
    ];

    // result
    expect(Math.min(...endWidths)).toBeCloseTo(0);
    expect(Math.max(...endWidths)).toBeCloseTo(10);
  });

  it('should keep a sample at the bend so the band turns the corner', () => {
    // before
    const polygon = getOpenPathProfilePolygon(ring, StrokeProfile.wedge, true);

    // result
    expect(polygon.some((point) => point.x > 100 && point.y < 0)).toBe(true);
  });
});
