// utils
import { rotateGlyphVertices } from '../rotateGlyphVertices';

describe('rotateGlyphVertices', () => {
  it('should return the same array reference when the angle is zero', () => {
    // before
    const vertices = new Float32Array([1, 2, 0.5, 0.25]);

    // result
    expect(rotateGlyphVertices(vertices, { x: 0, y: 0 }, 0)).toBe(vertices);
  });

  it('should rotate every vertex position around the centre while leaving uv coordinates untouched', () => {
    // before — one vertex at (1, 0) with uv (0.5, 0.25), rotated 90deg around the origin
    const vertices = new Float32Array([1, 0, 0.5, 0.25]);

    // result
    const rotated = rotateGlyphVertices(vertices, { x: 0, y: 0 }, 90);

    expect(rotated[0]).toBeCloseTo(0, 5);
    expect(rotated[1]).toBeCloseTo(1, 5);
    expect(rotated[2]).toBe(0.5);
    expect(rotated[3]).toBe(0.25);
  });

  it('should rotate around an arbitrary centre, keeping a vertex sitting on the centre in place', () => {
    // before — two vertices: one on the centre, one offset from it
    const vertices = new Float32Array([10, 10, 0, 0, 12, 10, 1, 1]);

    // result
    const rotated = rotateGlyphVertices(vertices, { x: 10, y: 10 }, 180);

    expect(Array.from(rotated.slice(0, 2))).toEqual([10, 10]);
    expect(rotated[4]).toBeCloseTo(8, 5);
    expect(rotated[5]).toBeCloseTo(10, 5);
  });

  it('should return an empty array when given no vertices', () => {
    // result
    expect(rotateGlyphVertices(new Float32Array(0), { x: 0, y: 0 }, 45)).toEqual(new Float32Array(0));
  });
});
