// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';
import { RECT_BATCH_FLOATS_PER_VERTEX } from './constants';

// types
import { TRectBatch, TRgb } from './types';

// utils
import { ensureRectBatchCapacity } from './ensureRectBatchCapacity';

type TUnitCircle = { cos: number[]; sin: number[] };

const unitCircles = new Map<number, TUnitCircle>();

const getUnitCircle = (segments: number): TUnitCircle => {
  const cached = unitCircles.get(segments);

  if (!cached) {
    const angles = Array.from({ length: segments + 1 }, (_, index) => ((index % segments) / segments) * Math.PI * 2);
    const created = { cos: angles.map((angle) => Math.cos(angle)), sin: angles.map((angle) => Math.sin(angle)) };
    unitCircles.set(segments, created);

    return created;
  }

  return cached;
};

const writeVertex = (data: Float32Array, offset: number, x: number, y: number, rgb: TRgb, alpha: number): number => {
  data[offset] = x;
  data[offset + 1] = y;
  data[offset + 2] = rgb[0];
  data[offset + 3] = rgb[1];
  data[offset + 4] = rgb[2];
  data[offset + 5] = alpha;

  return offset + RECT_BATCH_FLOATS_PER_VERTEX;
};

export const pushFilledCircle = (
  batch: TRectBatch,
  centerX: number,
  centerY: number,
  radius: number,
  rgb: TRgb,
  alpha: number,
  segments = ELLIPSE_SEGMENTS,
): void => {
  ensureRectBatchCapacity(batch, segments * 3 * RECT_BATCH_FLOATS_PER_VERTEX);

  const { data } = batch;
  const { cos, sin } = getUnitCircle(segments);
  let offset = batch.floatCount;

  for (let index = 0; index < segments; index += 1) {
    offset = writeVertex(data, offset, centerX, centerY, rgb, alpha);
    offset = writeVertex(data, offset, centerX + radius * cos[index], centerY + radius * sin[index], rgb, alpha);
    offset = writeVertex(data, offset, centerX + radius * cos[index + 1], centerY + radius * sin[index + 1], rgb, alpha);
  }

  batch.floatCount = offset;
};
