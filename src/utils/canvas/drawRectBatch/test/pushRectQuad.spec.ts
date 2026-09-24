// utils
import { createRectBatch } from '../createRectBatch';
import { pushRectQuad } from '../pushRectQuad';

const CORNERS = new Float32Array([0, 0, 10, 0, 10, 10, 0, 10]);

describe('pushRectQuad', () => {
  it('should append two triangles of interleaved position and color', () => {
    // mock
    const batch = createRectBatch();

    // before
    pushRectQuad(batch, CORNERS, [1, 0.5, 0.25], 0.5);

    // result
    expect(batch.floatCount).toBe(36);
    expect(Array.from(batch.data.subarray(0, 6))).toEqual([0, 0, 1, 0.5, 0.25, 0.5]);
    expect(Array.from(batch.data.subarray(12, 18))).toEqual([10, 10, 1, 0.5, 0.25, 0.5]);
    expect(Array.from(batch.data.subarray(30, 32))).toEqual([0, 10]);
  });

  it('should grow the backing array when it runs out of room', () => {
    // mock
    const batch = createRectBatch();
    const initialLength = batch.data.length;

    // before
    for (let index = 0; index < 1025; index += 1) {
      pushRectQuad(batch, CORNERS, [0, 0, 0], 1);
    }

    // result
    expect(batch.data.length).toBe(initialLength * 2);
    expect(batch.floatCount).toBe(1025 * 36);
  });
});
