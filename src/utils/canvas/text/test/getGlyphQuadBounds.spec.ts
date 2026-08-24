// utils
import { getGlyphQuadBounds } from '../getGlyphQuadBounds';

describe('getGlyphQuadBounds', () => {
  it('should return null for an empty vertex list', () => {
    // result
    expect(getGlyphQuadBounds(new Float32Array(0))).toBeNull();
  });

  it('should return the single point as degenerate bounds when there is only one vertex', () => {
    // before
    const vertices = new Float32Array([5, 10, 0, 0]);

    // result
    expect(getGlyphQuadBounds(vertices)).toEqual({ maxX: 5, maxY: 10, minX: 5, minY: 10 });
  });

  it('should find the min/max x and y across every vertex, ignoring the uv components', () => {
    // before — three vertices; uv values (indices 2,3) are deliberately out of range to prove they're ignored
    const vertices = new Float32Array([2, 8, 99, 99, -3, 4, 99, 99, 6, -1, 99, 99]);

    // result
    expect(getGlyphQuadBounds(vertices)).toEqual({ maxX: 6, maxY: 8, minX: -3, minY: -1 });
  });
});
