// utils
import { getRingVertices } from '../getRingVertices';

describe('getRingVertices', () => {
  it('should return 2 quads (24 flat numbers) for a 2-point ring', () => {
    // mock — a degenerate 2-point "ring" still wraps around via modulo
    const outer = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const inner = [
      { x: 1, y: 1 },
      { x: 9, y: 1 },
    ];

    // result
    expect(getRingVertices(outer, inner)).toHaveLength(24);
  });

  it('should pair each outer/inner point with the next one, wrapping the last back to the first', () => {
    // mock — a 3-point ring
    const outer = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ];
    const inner = [
      { x: 1, y: 1 },
      { x: 9, y: 1 },
      { x: 5, y: 9 },
    ];

    // result — the last quad wraps from index 2 back to index 0
    const vertices = getRingVertices(outer, inner);
    const lastQuad = vertices.slice(24, 36);

    expect(lastQuad).toEqual([5, 10, 0, 0, 1, 1, 5, 10, 1, 1, 5, 9]);
  });
});
