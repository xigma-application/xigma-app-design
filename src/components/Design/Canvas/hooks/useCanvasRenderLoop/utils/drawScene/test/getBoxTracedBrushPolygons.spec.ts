// types
import { StrokeBrushDirection, StrokeProfile } from 'types/design/enums';

// utils
import { buildStrokeRing } from '../buildStrokeRing';
import { getBoxTracedBrushPolygons } from '../getBoxTracedBrushPolygons';

const outer = [
  { x: -8, y: -8 },
  { x: 108, y: -8 },
  { x: 108, y: 108 },
  { x: -8, y: 108 },
];
const inner = [
  { x: 8, y: 8 },
  { x: 92, y: 8 },
  { x: 92, y: 92 },
  { x: 8, y: 92 },
];
const options = { direction: StrokeBrushDirection.right, flipped: false, profile: StrokeProfile.uniform, strokeWidth: 16 };
const band = [
  { u: 0, v: -1 },
  { u: 0.25, v: -1 },
  { u: 0.25, v: 1 },
  { u: 0, v: 1 },
];

describe('getBoxTracedBrushPolygons', () => {
  it('should lay a contour along the top edge for a band covering the first quarter, going right', () => {
    // action
    const polygons = getBoxTracedBrushPolygons(buildStrokeRing(outer, inner), options, [band])!;
    const points = polygons[0];

    // result
    expect(points.length).toBeGreaterThan(4);
    expect(Math.min(...points.map((point) => point.y))).toBeCloseTo(-8, 0);
    expect(Math.max(...points.map((point) => point.y))).toBeCloseTo(8, 0);
    expect(Math.max(...points.map((point) => point.x))).toBeLessThanOrEqual(110);
  });

  it('should start on the left side when going left', () => {
    // action
    const points = getBoxTracedBrushPolygons(buildStrokeRing(outer, inner), { ...options, direction: StrokeBrushDirection.left }, [
      band,
    ])![0];

    // result
    expect(Math.min(...points.map((point) => point.x))).toBeCloseTo(-8, 0);
    expect(Math.max(...points.map((point) => point.y))).toBeGreaterThan(90);
  });

  it('should narrow the band with a Width profile', () => {
    // action
    const uniform = getBoxTracedBrushPolygons(buildStrokeRing(outer, inner), options, [band])![0];
    const wedge = getBoxTracedBrushPolygons(buildStrokeRing(outer, inner), { ...options, profile: StrokeProfile.wedge }, [band])![0];
    const thickness = (points: { x: number; y: number }[]): number =>
      Math.max(...points.map((point) => point.y)) - Math.min(...points.map((point) => point.y));

    // result
    expect(thickness(wedge)).toBeLessThanOrEqual(thickness(uniform));
  });

  it('should return null without a stroke width', () => {
    // result
    expect(getBoxTracedBrushPolygons(buildStrokeRing(outer, inner), { ...options, strokeWidth: 0 }, [band])).toBeNull();
  });
});
