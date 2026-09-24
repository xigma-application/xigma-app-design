// types
import { TRectBatch } from './types';

export const ensureRectBatchCapacity = (batch: TRectBatch, extraFloats: number): void => {
  if (batch.floatCount + extraFloats > batch.data.length) {
    const grown = new Float32Array(Math.max(batch.data.length * 2, batch.floatCount + extraFloats));

    grown.set(batch.data.subarray(0, batch.floatCount));
    batch.data = grown;
  }
};
