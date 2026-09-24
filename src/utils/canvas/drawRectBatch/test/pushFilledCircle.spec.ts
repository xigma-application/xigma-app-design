// utils
import { createRectBatch } from '../createRectBatch';
import { pushFilledCircle } from '../pushFilledCircle';

const FLOATS_PER_CIRCLE = 64 * 3 * 6;

describe('pushFilledCircle', () => {
  it('should append a triangle fan of 64 slices around the center in one color', () => {
    // mock
    const batch = createRectBatch();

    // before
    pushFilledCircle(batch, 10, 20, 5, [1, 0.5, 0.25], 0.75);

    // result
    expect(batch.floatCount).toBe(FLOATS_PER_CIRCLE);
    expect(Array.from(batch.data.subarray(0, 6))).toEqual([10, 20, 1, 0.5, 0.25, 0.75]);
    expect(batch.data[6]).toBeCloseTo(15);
    expect(batch.data[7]).toBeCloseTo(20);
  });

  it('should close the fan by wrapping the last slice back to the first point', () => {
    // mock
    const batch = createRectBatch();

    // before
    pushFilledCircle(batch, 0, 0, 1, [0, 0, 0], 1);

    // result
    const lastSlice = (64 - 1) * 3 * 6;

    expect(batch.data[lastSlice + 12]).toBeCloseTo(1);
    expect(batch.data[lastSlice + 13]).toBeCloseTo(0);
  });

  it('should grow the batch when it runs out of room', () => {
    // mock
    const batch = createRectBatch();
    const initial = batch.data.length;

    // before
    for (let index = 0; index < 40; index += 1) {
      pushFilledCircle(batch, 0, 0, 1, [0, 0, 0], 1);
    }

    // result
    expect(batch.data.length).toBeGreaterThan(initial);
    expect(batch.floatCount).toBe(40 * FLOATS_PER_CIRCLE);
  });

  it('should use the requested number of slices', () => {
    // mock
    const batch = createRectBatch();

    // before
    pushFilledCircle(batch, 0, 0, 1, [0, 0, 0], 1, 8);
    pushFilledCircle(batch, 0, 0, 1, [0, 0, 0], 1, 8);

    // result
    expect(batch.floatCount).toBe(2 * 8 * 3 * 6);
  });
});
