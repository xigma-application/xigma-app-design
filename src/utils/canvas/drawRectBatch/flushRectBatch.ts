// others
import { RECT_BATCH_FLOATS_PER_VERTEX } from './constants';

// types
import { TRectBatch } from './types';
import { TViewport } from 'types/design/types';

// utils
import { drawRectBuffer } from './drawRectBuffer';
import { getRectBatchResources } from './getRectBatchResources';
import { setRectBatchUniforms } from './setRectBatchUniforms';

export const flushRectBatch = (
  gl: WebGL2RenderingContext,
  batch: TRectBatch,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const resources = getRectBatchResources(gl);

  if (resources && batch.floatCount > 0) {
    setRectBatchUniforms(gl, resources.program, canvasWidth, canvasHeight, viewport);
    gl.bindBuffer(gl.ARRAY_BUFFER, resources.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, batch.data.subarray(0, batch.floatCount), gl.STREAM_DRAW);
    drawRectBuffer(gl, resources.buffer, batch.floatCount / RECT_BATCH_FLOATS_PER_VERTEX);
  }

  batch.floatCount = 0;
};
