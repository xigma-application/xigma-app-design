// others
import { RECT_BATCH_FLOATS_PER_VERTEX } from './constants';

// types
import { TPoint } from 'types/canvas';
import { TRectBatch, TRgb } from './types';

// utils
import { ensureRectBatchCapacity } from './ensureRectBatchCapacity';

const VERTICES_PER_QUAD = 6;

const writeVertex = (data: Float32Array, offset: number, point: TPoint, rgb: TRgb, alpha: number): number => {
  data[offset] = point.x;
  data[offset + 1] = point.y;
  data[offset + 2] = rgb[0];
  data[offset + 3] = rgb[1];
  data[offset + 4] = rgb[2];
  data[offset + 5] = alpha;

  return offset + RECT_BATCH_FLOATS_PER_VERTEX;
};

export const pushRingStrip = (batch: TRectBatch, outer: TPoint[], inner: TPoint[], rgb: TRgb, alpha: number): void => {
  ensureRectBatchCapacity(batch, outer.length * VERTICES_PER_QUAD * RECT_BATCH_FLOATS_PER_VERTEX);

  const { data } = batch;
  let offset = batch.floatCount;

  for (let index = 0; index < outer.length; index += 1) {
    const next = (index + 1) % outer.length;

    offset = writeVertex(data, offset, outer[index], rgb, alpha);
    offset = writeVertex(data, offset, outer[next], rgb, alpha);
    offset = writeVertex(data, offset, inner[next], rgb, alpha);
    offset = writeVertex(data, offset, outer[index], rgb, alpha);
    offset = writeVertex(data, offset, inner[next], rgb, alpha);
    offset = writeVertex(data, offset, inner[index], rgb, alpha);
  }

  batch.floatCount = offset;
};
