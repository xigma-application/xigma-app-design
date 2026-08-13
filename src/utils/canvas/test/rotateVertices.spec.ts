// utils
import { rotateVertices } from '../rotateVertices';

describe('rotateVertices', () => {
  it('should return the exact same array reference when degrees is 0', () => {
    // mock
    const vertices = new Float32Array([10, 5, 0.25, 0.5]);

    // result
    expect(rotateVertices(vertices, { x: 0, y: 0 }, 0)).toBe(vertices);
  });

  it('should rotate every vertex position around the center, leaving uv untouched', () => {
    // mock — two vertices, interleaved [x, y, u, v]
    const vertices = new Float32Array([10, 0, 0.25, 0.5, 0, 0, 0.75, 0.125]);

    // action
    const rotated = rotateVertices(vertices, { x: 0, y: 0 }, 90);

    // result — (10, 0) rotates to (0, 10); the center point (0, 0) stays put; uv unchanged
    expect(rotated[0]).toBeCloseTo(0);
    expect(rotated[1]).toBeCloseTo(10);
    expect(rotated[2]).toBe(0.25);
    expect(rotated[3]).toBe(0.5);
    expect(rotated[4]).toBeCloseTo(0);
    expect(rotated[5]).toBeCloseTo(0);
    expect(rotated[6]).toBe(0.75);
    expect(rotated[7]).toBe(0.125);
  });
});
