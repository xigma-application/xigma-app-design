// utils
import { createRectBatch } from '../createRectBatch';
import { pushRingStrip } from '../pushRingStrip';

describe('pushRingStrip', () => {
  it('should emit two triangles per outline edge pairing each outer point with the inner one, wrapping around', () => {
    // mock
    const batch = createRectBatch();
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

    // before
    pushRingStrip(batch, outer, inner, [1, 0.5, 0.25], 0.75);

    // result — 3 quads x 6 vertices x 6 floats
    expect(batch.floatCount).toBe(108);

    const positions = (quad: number): number[] =>
      Array.from({ length: 6 }, (_, vertex) => [batch.data[quad * 36 + vertex * 6], batch.data[quad * 36 + vertex * 6 + 1]]).flat();

    expect(positions(0)).toEqual([0, 0, 10, 0, 9, 1, 0, 0, 9, 1, 1, 1]);
    expect(positions(2)).toEqual([5, 10, 0, 0, 1, 1, 5, 10, 1, 1, 5, 9]);
    expect(Array.from(batch.data.subarray(2, 6))).toEqual([1, 0.5, 0.25, 0.75]);
  });

  it('should append after existing content and grow the batch when needed', () => {
    // mock
    const batch = createRectBatch();
    const ring = Array.from({ length: 300 }, (_, index) => ({ x: index, y: 0 }));

    // before
    pushRingStrip(batch, ring, ring, [0, 0, 0], 1);
    pushRingStrip(batch, ring, ring, [0, 0, 0], 1);

    // result
    expect(batch.floatCount).toBe(2 * 300 * 36);
  });
});
