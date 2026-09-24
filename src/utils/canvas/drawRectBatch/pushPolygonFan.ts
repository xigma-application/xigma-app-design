// others
import { RECT_BATCH_FLOATS_PER_VERTEX } from './constants';

// types
import { TPoint } from 'types/canvas';
import { TRectBatch, TRgb } from './types';

// utils
import { ensureRectBatchCapacity } from './ensureRectBatchCapacity';

const writeVertex = (data: Float32Array, offset: number, point: TPoint, rgb: TRgb, alpha: number): number => {
  data[offset] = point.x;
  data[offset + 1] = point.y;
  data[offset + 2] = rgb[0];
  data[offset + 3] = rgb[1];
  data[offset + 4] = rgb[2];
  data[offset + 5] = alpha;

  return offset + RECT_BATCH_FLOATS_PER_VERTEX;
};

export const pushPolygonFan = (batch: TRectBatch, center: TPoint, points: TPoint[], rgb: TRgb, alpha: number): void => {
  ensureRectBatchCapacity(batch, points.length * 3 * RECT_BATCH_FLOATS_PER_VERTEX);

  const { data } = batch;
  let offset = batch.floatCount;

  for (let index = 0; index < points.length; index += 1) {
    offset = writeVertex(data, offset, center, rgb, alpha);
    offset = writeVertex(data, offset, points[index], rgb, alpha);
    offset = writeVertex(data, offset, points[(index + 1) % points.length], rgb, alpha);
  }

  batch.floatCount = offset;
};
