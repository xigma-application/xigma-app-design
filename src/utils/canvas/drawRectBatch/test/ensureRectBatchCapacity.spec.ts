// utils
import { createRectBatch } from '../createRectBatch';
import { ensureRectBatchCapacity } from '../ensureRectBatchCapacity';

describe('ensureRectBatchCapacity', () => {
  it('should leave the array alone when the extra floats still fit', () => {
    // mock
    const batch = createRectBatch();
    const data = batch.data;

    // before
    ensureRectBatchCapacity(batch, 10);

    // result
    expect(batch.data).toBe(data);
  });

  it('should double the array and keep the existing floats when it is full', () => {
    // mock
    const batch = createRectBatch();

    batch.data[0] = 7;
    batch.floatCount = batch.data.length;

    // before
    ensureRectBatchCapacity(batch, 6);

    // result
    expect(batch.data.length).toBeGreaterThanOrEqual(batch.floatCount + 6);
    expect(batch.data[0]).toBe(7);
  });

  it('should grow at least to the requested size even when doubling is not enough', () => {
    // mock
    const batch = createRectBatch();
    const needed = batch.data.length * 5;

    // before
    ensureRectBatchCapacity(batch, needed);

    // result
    expect(batch.data.length).toBeGreaterThanOrEqual(needed);
  });
});
