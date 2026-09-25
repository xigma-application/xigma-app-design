// utils
import { buildOpenPolylineStrokeRing } from '../buildOpenPolylineStrokeRing';

describe('buildOpenPolylineStrokeRing', () => {
  it('should build an open ring along the polyline with mitred sides', () => {
    // before
    const ring = buildOpenPolylineStrokeRing(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      1,
    );

    // result
    expect(ring.closed).toBe(false);
    expect(ring.perimeter).toBe(20);
    expect(ring.lengths).toEqual([10, 10, 0]);
    expect(ring.cumulative).toEqual([0, 10, 20]);
    expect(ring.outer[1].x).toBeCloseTo(9);
    expect(ring.outer[1].y).toBeCloseTo(1);
    expect(ring.inner[1].x).toBeCloseTo(11);
    expect(ring.inner[1].y).toBeCloseTo(-1);
  });
});
