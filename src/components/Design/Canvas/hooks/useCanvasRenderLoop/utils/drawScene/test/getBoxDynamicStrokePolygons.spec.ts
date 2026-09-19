// types
import { TPoint } from 'types/canvas';

// utils
import { getBoxDynamicStrokePolygons } from '../getBoxDynamicStrokePolygons';

const outer: TPoint[] = [
  { x: -5, y: -5 },
  { x: 105, y: -5 },
  { x: 105, y: 105 },
  { x: -5, y: 105 },
];
const inner: TPoint[] = [
  { x: 5, y: 5 },
  { x: 95, y: 5 },
  { x: 95, y: 95 },
  { x: 5, y: 95 },
];
const options = { frequency: 75, seed: 'node', smoothen: 50, strokeWidth: 10, wiggle: 30 };

describe('getBoxDynamicStrokePolygons', () => {
  it('should return an outer and an inner loop with many more points than the plain rectangle', () => {
    // action
    const loops = getBoxDynamicStrokePolygons(outer, inner, options);

    // result
    expect(loops).toHaveLength(2);
    expect(loops![0].length).toBeGreaterThan(40);
    expect(loops![1].length).toBeGreaterThan(40);
  });

  it('should be deterministic for one seed and differ for another', () => {
    // action
    const first = getBoxDynamicStrokePolygons(outer, inner, options);
    const again = getBoxDynamicStrokePolygons(outer, inner, options);
    const other = getBoxDynamicStrokePolygons(outer, inner, { ...options, seed: 'other' });

    // result
    expect(first).toEqual(again);
    expect(first).not.toEqual(other);
  });

  it('should leave the path untouched at Wiggle 0 and keep the stroke width constant while wiggling', () => {
    // action
    const flat = getBoxDynamicStrokePolygons(outer, inner, { ...options, wiggle: 0 })!;
    const wobbly = getBoxDynamicStrokePolygons(outer, inner, options)!;

    // result
    expect(flat[0].every((point) => Math.abs(Math.abs(point.x - 50) - 55) < 1e-9 || Math.abs(Math.abs(point.y - 50) - 55) < 1e-9)).toBe(
      true,
    );

    const topOuter = wobbly[0].filter((point) => point.x > 10 && point.x < 90 && point.y < 0);

    expect(Math.max(...topOuter.map((point) => Math.abs(point.y + 5)))).toBeLessThanOrEqual(3 + 1e-9);
    expect(Math.max(...topOuter.map((point) => Math.abs(point.y + 5)))).toBeGreaterThan(0.1);
  });

  it('should reach farther with a bigger Wiggle and be unbounded above', () => {
    // action
    const far = getBoxDynamicStrokePolygons(outer, inner, { ...options, strokeWidth: 1, wiggle: 60000 })!;

    // result
    expect(Math.max(...far[0].map((point) => Math.abs(point.y)))).toBeGreaterThan(100);
  });

  it('should return null for a zero perimeter or width', () => {
    // result
    expect(getBoxDynamicStrokePolygons(outer, inner, { ...options, strokeWidth: 0 })).toBeNull();
    expect(getBoxDynamicStrokePolygons([{ x: 0, y: 0 }], [{ x: 0, y: 0 }], options)).toBeNull();
  });
});
