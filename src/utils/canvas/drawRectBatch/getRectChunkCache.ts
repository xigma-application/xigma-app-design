// types
import { TBatchShape, TRectChunk } from './types';

export type TRectChunkCache = {
  all: Set<TRectChunk>;
  chunks: Map<TBatchShape, TRectChunk>;
  touched: Set<TRectChunk>;
};

const cacheByContext = new WeakMap<WebGL2RenderingContext, TRectChunkCache>();

export const getRectChunkCache = (gl: WebGL2RenderingContext): TRectChunkCache => {
  const existing = cacheByContext.get(gl);

  if (!existing) {
    const created: TRectChunkCache = { all: new Set(), chunks: new Map(), touched: new Set() };
    cacheByContext.set(gl, created);

    return created;
  }

  return existing;
};
