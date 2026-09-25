// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { TDraftLine } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getLineStrokeOutlineLoops } from '../vectorNetwork/getNodeStrokeOutline/getLineStrokeOutlineLoops';

const cache = new WeakMap<TDraftLine, TPoint[] | null>();

export const getLineStrokePolygon = (line: TDraftLine): TPoint[] | null => {
  if (!cache.has(line)) {
    cache.set(line, getLineStrokeOutlineLoops(line, (line.strokeWidth ?? LINE_RENDER_STROKE_WIDTH) / 2)?.outer ?? null);
  }

  return cache.get(line) ?? null;
};
