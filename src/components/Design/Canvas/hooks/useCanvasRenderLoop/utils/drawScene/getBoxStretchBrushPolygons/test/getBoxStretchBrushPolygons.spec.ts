// types
import { StrokeBrushDirection, StrokeProfile } from 'types/design/enums';

// utils
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
    const polygons = getBoxStretchBrushPolygons(outer, inner, options)!;

    // result
    expect(polygons.length).toBeGreaterThan(2);
    expect(polygons[0].length).toBeGreaterThan(100);
    expect(polygons.slice(2).every((hole) => hole.length === 8)).toBe(true);
  });

  it('should taper from thick at the start to thin at the end and mirror it for the other direction', () => {
    // action
    const right = getBoxStretchBrushPolygons(outer, inner, options)!;
    const left = getBoxStretchBrushPolygons(outer, inner, { ...options, direction: StrokeBrushDirection.left })!;
    const onTop = (point: { x: number; y: number }): boolean => point.y < 30 && point.x > 50 && point.x < 350;
    const onBottom = (point: { x: number; y: number }): boolean => point.y > 330 && point.x > 50 && point.x < 350;

    // result
    expect(getThickness(right, onTop)).toBeGreaterThan(getThickness(right, onBottom));
    expect(getThickness(left, onTop)).toBeLessThan(getThickness(left, onBottom));
  });

  it('should be deterministic for one seed and differ for another', () => {
    // result
    expect(getBoxStretchBrushPolygons(outer, inner, options)).toEqual(getBoxStretchBrushPolygons(outer, inner, options));
    expect(getBoxStretchBrushPolygons(outer, inner, { ...options, seed: 'other' })).not.toEqual(
      getBoxStretchBrushPolygons(outer, inner, options),
    );
  });

  it('should return null without a stroke width', () => {
    // result
    expect(getBoxStretchBrushPolygons(outer, inner, { ...options, strokeWidth: 0 })).toBeNull();
  });
});
