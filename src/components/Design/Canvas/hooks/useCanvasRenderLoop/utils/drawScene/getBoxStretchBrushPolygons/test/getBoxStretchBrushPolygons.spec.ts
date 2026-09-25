// types
import { StrokeBrushDirection, StrokeProfile } from 'types/design/enums';

// utils
import { buildOpenStrokeRing } from '../../buildOpenStrokeRing';
import { buildStrokeRing } from '../../buildStrokeRing';
import { getBoxStretchBrushPolygons } from '../getBoxStretchBrushPolygons';

const outer = [
  { x: -8, y: -8 },
  { x: 408, y: -8 },
  { x: 408, y: 368 },
  { x: -8, y: 368 },
];
const inner = [
  { x: 8, y: 8 },
  { x: 392, y: 8 },
  { x: 392, y: 352 },
  { x: 8, y: 352 },
];
const options = {
  direction: StrokeBrushDirection.right,
  flipped: false,
  index: 0,
  profile: StrokeProfile.uniform,
  seed: 'node',
  strokeWidth: 16,
};

const getThickness = (polygons: { x: number; y: number }[][], match: (point: { x: number; y: number }) => boolean): number => {
  const outerPoints = polygons[0].filter(match);
  const innerPoints = polygons[1].filter(match);

  return Math.abs(
    outerPoints.reduce((total, point) => total + point.y, 0) / outerPoints.length -
      innerPoints.reduce((total, point) => total + point.y, 0) / innerPoints.length,
  );
};

describe('getBoxStretchBrushPolygons', () => {
  it('should return an outer and an inner loop plus small holes', () => {
    // action
    const polygons = getBoxStretchBrushPolygons(buildStrokeRing(outer, inner), options)!;

    // result
    expect(polygons.length).toBeGreaterThan(2);
    expect(polygons[0].length).toBeGreaterThan(100);
    expect(polygons.slice(2).every((hole) => hole.length === 8)).toBe(true);
  });

  it('should taper from thick at the start to thin at the end and mirror it for the other direction', () => {
    // action
    const right = getBoxStretchBrushPolygons(buildStrokeRing(outer, inner), options)!;
    const left = getBoxStretchBrushPolygons(buildStrokeRing(outer, inner), { ...options, direction: StrokeBrushDirection.left })!;
    const onTop = (point: { x: number; y: number }): boolean => point.y < 30 && point.x > 50 && point.x < 350;
    const onBottom = (point: { x: number; y: number }): boolean => point.y > 330 && point.x > 50 && point.x < 350;

    // result
    expect(getThickness(right, onTop)).toBeGreaterThan(getThickness(right, onBottom));
    expect(getThickness(left, onTop)).toBeLessThan(getThickness(left, onBottom));
  });

  it('should be deterministic for one seed and differ for another', () => {
    // result
    expect(getBoxStretchBrushPolygons(buildStrokeRing(outer, inner), options)).toEqual(
      getBoxStretchBrushPolygons(buildStrokeRing(outer, inner), options),
    );
    expect(getBoxStretchBrushPolygons(buildStrokeRing(outer, inner), { ...options, seed: 'other' })).not.toEqual(
      getBoxStretchBrushPolygons(buildStrokeRing(outer, inner), options),
    );
  });

  it('should return null without a stroke width', () => {
    // result
    expect(getBoxStretchBrushPolygons(buildStrokeRing(outer, inner), { ...options, strokeWidth: 0 })).toBeNull();
  });

  it('should draw an open ring as one band running from its start to its end, plus the holes', () => {
    // before
    const [band] = getBoxStretchBrushPolygons(buildOpenStrokeRing({ x: 0, y: 0 }, { x: 300, y: 0 }, 8), options) ?? [];
    const xs = band.map((point) => point.x);

    // result
    expect(Math.min(...xs)).toBeLessThan(5);
    expect(Math.max(...xs)).toBeGreaterThan(295);
    expect(band.some((point) => point.y < 0) && band.some((point) => point.y > 0)).toBe(true);
  });
});
