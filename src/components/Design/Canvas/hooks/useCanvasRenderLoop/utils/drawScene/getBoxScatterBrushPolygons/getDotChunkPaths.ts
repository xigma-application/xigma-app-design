// types
import { TPoint } from 'types/canvas';
import { TScatterDot } from './types';

// others
import { STROKE_BRUSH_DOTS_PER_CHUNK } from 'constant/strokeBrush';

// utils
import { getChunkPath } from './getChunkPath';

export const getDotChunkPaths = (dots: TScatterDot[]): TPoint[][] =>
  Array.from({ length: Math.ceil(dots.length / STROKE_BRUSH_DOTS_PER_CHUNK) }, (_, chunk) =>
    getChunkPath(dots.slice(chunk * STROKE_BRUSH_DOTS_PER_CHUNK, (chunk + 1) * STROKE_BRUSH_DOTS_PER_CHUNK)),
  ).filter((path) => path.length > 0);
