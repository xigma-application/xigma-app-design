// utils
import { createRectBatch } from '../createRectBatch';

describe('createRectBatch', () => {
  it('should create an empty batch with room for the initial rect capacity', () => {
    // before
    const batch = createRectBatch();

    // result
    expect(batch.floatCount).toBe(0);
    expect(batch.data.length).toBe(1024 * 6 * 6);
  });
});
