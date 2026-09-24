// types
import { TRectChunk } from './types';
import { TViewport } from 'types/design/types';

// utils
import { drawRectBuffer } from './drawRectBuffer';
import { getRectBatchResources } from './getRectBatchResources';
import { setRectBatchUniforms } from './setRectBatchUniforms';

const isChunkVisible = (chunk: TRectChunk, canvasWidth: number, canvasHeight: number, viewport: TViewport): boolean => {
  const { bounds } = chunk;
  const { x, y, zoom } = viewport;

  return (
    bounds.maxX * zoom + x >= 0 &&
    bounds.maxY * zoom + y >= 0 &&
    bounds.minX * zoom + x <= canvasWidth &&
    bounds.minY * zoom + y <= canvasHeight
  );
};

export const drawRectChunk = (
  gl: WebGL2RenderingContext,
  chunk: TRectChunk,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const resources = getRectBatchResources(gl);

  if (resources && isChunkVisible(chunk, canvasWidth, canvasHeight, viewport)) {
    setRectBatchUniforms(gl, resources.program, canvasWidth, canvasHeight, viewport);
    drawRectBuffer(gl, chunk.buffer, chunk.vertexCount);
  }
};
