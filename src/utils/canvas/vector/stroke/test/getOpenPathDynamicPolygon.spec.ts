// utils
import { buildOpenPolylineStrokeRing } from '../buildOpenPolylineStrokeRing';
import { getOpenPathDynamicPolygon } from '../getOpenPathDynamicPolygon';

const ring = buildOpenPolylineStrokeRing(
  [
    { x: 0, y: 0 },
    { x: 200, y: 0 },
    { x: 200, y: 200 },
  ],
  5,
);

describe('getOpenPathDynamicPolygon', () => {
  it('should wiggle both sides of the band along the path', () => {
    // before
    const polygon = getOpenPathDynamicPolygon(ring, { frequency: 50, smoothen: 50, wiggle: 50 }, 'seed', 10) ?? [];
    const topSide = polygon.slice(0, polygon.length / 2).filter((point) => point.x < 190);

    // result
    expect(new Set(topSide.map((point) => point.y.toFixed(2))).size).toBeGreaterThan(2);
  });

  it('should keep the same shape for the same seed', () => {
    // result
    expect(getOpenPathDynamicPolygon(ring, { frequency: 50, smoothen: 0, wiggle: 50 }, 'seed', 10)).toEqual(
      getOpenPathDynamicPolygon(ring, { frequency: 50, smoothen: 0, wiggle: 50 }, 'seed', 10),
    );
  });

  it('should draw nothing without a frequency', () => {
    // result
    expect(getOpenPathDynamicPolygon(ring, { frequency: 0, smoothen: 0, wiggle: 50 }, 'seed', 10)).toBeNull();
  });
});
