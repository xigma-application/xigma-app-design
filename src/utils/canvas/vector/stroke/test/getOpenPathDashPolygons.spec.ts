// types
import { StrokeDashCap } from 'types/design/enums';

// utils
import { buildOpenPolylineStrokeRing } from '../buildOpenPolylineStrokeRing';
import { getOpenPathDashPolygons } from '../getOpenPathDashPolygons';

const ring = buildOpenPolylineStrokeRing(
  [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ],
  1,
);

describe('getOpenPathDashPolygons', () => {
  it('should cut the path into dashes following the pattern, clipping the last one at the end', () => {
    // before
    const polygons = getOpenPathDashPolygons(ring, [30, 10, 0, 5], StrokeDashCap.none, 1) ?? [];

    // result
    expect(polygons).toHaveLength(3);
    expect(Math.max(...polygons[2].map((point) => point.x))).toBeCloseTo(100);
  });

  it('should give up on a pattern that would need too many dashes', () => {
    // result
    expect(getOpenPathDashPolygons(ring, [0.001, 0.001], StrokeDashCap.none, 1)).toBeNull();
  });
});
