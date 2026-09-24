// others
import { RECT_BATCH_FLOATS_PER_VERTEX, RECT_BATCH_VERTICES_PER_RECT } from './constants';

// types
import { TRectBatch, TRgb } from './types';

// utils
import { ensureRectBatchCapacity } from './ensureRectBatchCapacity';

const FLOATS_PER_QUAD = RECT_BATCH_FLOATS_PER_VERTEX * RECT_BATCH_VERTICES_PER_RECT;
const QUAD_CORNER_ORDER = [0, 1, 2, 0, 2, 3];

export const pushRectQuad = (batch: TRectBatch, corners: Float32Array, rgb: TRgb, alpha: number): void => {
  ensureRectBatchCapacity(batch, FLOATS_PER_QUAD);

  const { data } = batch;
  let offset = batch.floatCount;

  for (let index = 0; index < QUAD_CORNER_ORDER.length; index += 1) {
    const corner = QUAD_CORNER_ORDER[index] * 2;

    data[offset] = corners[corner];
    data[offset + 1] = corners[corner + 1];
    data[offset + 2] = rgb[0];
    data[offset + 3] = rgb[1];
    data[offset + 4] = rgb[2];
    data[offset + 5] = alpha;
    offset += RECT_BATCH_FLOATS_PER_VERTEX;
  }

  batch.floatCount = offset;
};
