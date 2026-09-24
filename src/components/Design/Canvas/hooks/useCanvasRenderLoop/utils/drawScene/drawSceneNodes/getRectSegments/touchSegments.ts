// types
import { TRectChunk } from 'utils/canvas/drawRectBatch/types';
import { TRectSegment } from '../types';

// utils
import { getRectChunkCache } from 'utils/canvas/drawRectBatch/getRectChunkCache';
import { touchRectChunk } from 'utils/canvas/drawRectBatch/touchRectChunk';

export const touchSegments = (gl: WebGL2RenderingContext, segments: TRectSegment[]): boolean => {
  const { all } = getRectChunkCache(gl);
  const chunks = segments.flatMap((segment) => ('chunk' in segment ? [segment.chunk as TRectChunk] : []));

  if (chunks.every((chunk) => all.has(chunk))) {
    chunks.forEach((chunk) => touchRectChunk(gl, chunk));
    return true;
  }

  return false;
};
