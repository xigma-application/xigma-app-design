// types
import { StrokeBrushDirection, StrokeProfile } from 'types/design/enums';

// utils
import { getBoxScatterBrushPolygons } from '../getBoxScatterBrushPolygons';

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
  angularJitter: 180,
  direction: StrokeBrushDirection.right,
  flipped: false,
  gap: 45,
  index: 0,
  profile: StrokeProfile.uniform,
  rotation: 179,
  seed: 'node',
  sizeJitter: 0,
  strokeWidth: 16,
  wiggle: 0,
};

const countDots = (polygons: { x: number; y: number }[][]): number =>
  polygons.reduce((total, path) => total + Math.round(path.length / 8), 0);

describe('getBoxScatterBrushPolygons', () => {
  it('should split the dots into chunks and cap the total dot count', () => {
    // action
    const polygons = getBoxScatterBrushPolygons(outer, inner, options)!;

    // result
    expect(polygons.length).toBeGreaterThan(50);
    expect(countDots(polygons)).toBeLessThanOrEqual(34000);
  });

  it('should place far fewer stamps with a bigger Gap', () => {
    // action
    const tight = getBoxScatterBrushPolygons(outer, inner, options)!;
    const loose = getBoxScatterBrushPolygons(outer, inner, { ...options, gap: 500 })!;

    // result
    expect(countDots(loose)).toBeLessThan(countDots(tight) / 4);
  });

  it('should spread the stamps further from the path with Wiggle', () => {
    // action
    const flat = getBoxScatterBrushPolygons(outer, inner, { ...options, gap: 500 })!.flat();
    const wiggled = getBoxScatterBrushPolygons(outer, inner, { ...options, gap: 500, wiggle: 200 })!.flat();
    const reach = (points: { x: number; y: number }[]): number => Math.max(...points.map((point) => Math.abs(point.y - 180)));

    // result
    expect(reach(wiggled)).toBeGreaterThan(reach(flat));
  });

  it('should be deterministic for one seed', () => {
    // result
    expect(getBoxScatterBrushPolygons(outer, inner, options)).toEqual(getBoxScatterBrushPolygons(outer, inner, options));
  });

  it('should return null without a stroke width', () => {
    // result
    expect(getBoxScatterBrushPolygons(outer, inner, { ...options, strokeWidth: 0 })).toBeNull();
  });
});
