// types
import { TDotBuffer } from './types';
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { createRectBatch } from 'utils/canvas/drawRectBatch/createRectBatch';
import { pushSwapHandleDots } from './pushSwapHandleDots';
import { RECT_BATCH_FLOATS_PER_VERTEX } from 'utils/canvas/drawRectBatch/constants';

const scratch = createRectBatch();

const finishDotBuffer = (buffer: WebGLBuffer, layout: TSmartSelectionLayout, zoom: number): TDotBuffer => {
  const built = { buffer, layout, vertexCount: scratch.floatCount / RECT_BATCH_FLOATS_PER_VERTEX, zoom };
  scratch.floatCount = 0;

  return built;
};

export const buildDotBuffer = (gl: WebGL2RenderingContext, layout: TSmartSelectionLayout, zoom: number): TDotBuffer | null => {
  const buffer = gl.createBuffer();

  if (buffer) {
    scratch.floatCount = 0;
    pushSwapHandleDots(scratch, layout, zoom);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, scratch.data.subarray(0, scratch.floatCount), gl.STATIC_DRAW);

    return finishDotBuffer(buffer, layout, zoom);
  }

  return null;
};
