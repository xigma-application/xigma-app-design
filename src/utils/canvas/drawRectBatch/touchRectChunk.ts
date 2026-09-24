// types
import { TRectChunk } from './types';

// utils
import { getRectChunkCache } from './getRectChunkCache';

export const touchRectChunk = (gl: WebGL2RenderingContext, chunk: TRectChunk): void => {
  getRectChunkCache(gl).touched.add(chunk);
};
