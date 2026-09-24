// types
import { TBatchShape, TRectChunk } from './types';

// utils
import { buildRectChunk } from './buildRectChunk';
import { createRectBatch } from './createRectBatch';
import { getRectChunkCache } from './getRectChunkCache';

const scratch = createRectBatch();

const isSameRun = (chunk: TRectChunk, run: TBatchShape[], baseOpacity: number): boolean =>
  chunk.baseOpacity === baseOpacity && chunk.nodes.length === run.length && chunk.nodes.every((node, index) => node === run[index]);

export const acquireRectChunk = (
  gl: WebGL2RenderingContext,
  run: TBatchShape[],
  baseOpacity: number,
  getOpacity: (node: TBatchShape) => number,
): TRectChunk | null => {
  const cache = getRectChunkCache(gl);
  const previous = cache.chunks.get(run[0]);

  if (!previous || !isSameRun(previous, run, baseOpacity)) {
    const chunk = buildRectChunk(gl, scratch, run, baseOpacity, getOpacity);

    if (chunk) {
      cache.all.add(chunk);
      cache.chunks.set(run[0], chunk);
      cache.touched.add(chunk);
    }

    return chunk;
  }

  cache.touched.add(previous);

  return previous;
};
