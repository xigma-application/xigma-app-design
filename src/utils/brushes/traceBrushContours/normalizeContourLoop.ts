// types
import { TBrushContourPoint, TBrushStrip } from '../types';
import { TContourPoint } from './types';

export const normalizeContourLoop = (loop: TContourPoint[], strip: TBrushStrip): TBrushContourPoint[] =>
  loop.map((vertex) => ({ u: vertex.x / (strip.length - 1), v: (vertex.y - strip.halfWidth) / strip.scale }));
