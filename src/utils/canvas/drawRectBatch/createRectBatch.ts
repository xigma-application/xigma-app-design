// others
import { RECT_BATCH_FLOATS_PER_VERTEX, RECT_BATCH_INITIAL_CAPACITY_RECTS, RECT_BATCH_VERTICES_PER_RECT } from './constants';

// types
import { TRectBatch } from './types';

export const createRectBatch = (): TRectBatch => ({
  data: new Float32Array(RECT_BATCH_INITIAL_CAPACITY_RECTS * RECT_BATCH_VERTICES_PER_RECT * RECT_BATCH_FLOATS_PER_VERTEX),
  floatCount: 0,
});
