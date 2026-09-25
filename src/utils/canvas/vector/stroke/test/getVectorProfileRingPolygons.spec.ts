// types
import { StrokeProfile } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { getVectorProfileRingPolygons } from '../getVectorProfileRingPolygons';

const square: TPoint[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const getWidths = ([outer, inner]: TPoint[][]): number[] =>
  outer.map((point, index) => Math.hypot(point.x - inner[index].x, point.y - inner[index].y));

describe('getVectorProfileRingPolygons', () => {
  it('should return an outer and an inner ring around the loop with matching sample counts', () => {
    // before
    const polygons = getVectorProfileRingPolygons(square, 5, StrokeProfile.taper, false);

    // result
    expect(polygons).toHaveLength(2);
    expect(polygons[0]).toHaveLength(256);
    expect(polygons[1]).toHaveLength(256);
  });

  it('should shrink the ring width along the loop following the width profile', () => {
    // before
    const widths = getWidths(getVectorProfileRingPolygons(square, 5, StrokeProfile.taper, false));

    // result
    expect(Math.max(...widths)).toBeGreaterThan(9);
    expect(Math.max(...widths)).toBeLessThanOrEqual(10 * Math.SQRT2 + 1e-6);
    expect(Math.min(...widths)).toBeLessThan(6);
  });

  it('should use the quarter taper multiplier for the quarter taper profile', () => {
    // before
    const widths = getWidths(getVectorProfileRingPolygons(square, 5, StrokeProfile.quarterTaper, false));

    // result
    expect(Math.max(...widths)).toBeGreaterThan(9);
    expect(Math.max(...widths)).toBeLessThanOrEqual(10 * Math.SQRT2 + 1e-6);
    expect(Math.min(...widths)).toBeLessThan(Math.max(...widths));
  });
});
