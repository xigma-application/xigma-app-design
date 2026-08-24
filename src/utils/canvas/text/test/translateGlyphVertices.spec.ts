// utils
import { translateGlyphVertices } from '../translateGlyphVertices';

describe('translateGlyphVertices', () => {
  it('should shift every vertex position by dx/dy while leaving uv coordinates untouched', () => {
    // before — two vertices: (1,2,uv 0.5,0.25) and (3,4,uv 0.75,1)
    const vertices = new Float32Array([1, 2, 0.5, 0.25, 3, 4, 0.75, 1]);

    // result
    const translated = translateGlyphVertices(vertices, 10, -5);

    expect(Array.from(translated)).toEqual([11, -3, 0.5, 0.25, 13, -1, 0.75, 1]);
  });

  it('should return an empty array unchanged', () => {
    // result
    expect(translateGlyphVertices(new Float32Array(0), 5, 5)).toEqual(new Float32Array(0));
  });
});
