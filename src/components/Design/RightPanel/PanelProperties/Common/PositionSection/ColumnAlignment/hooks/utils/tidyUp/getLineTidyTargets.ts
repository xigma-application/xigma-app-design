// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getModeGap } from './getModeGap';

export const getLineTidyTargets = (rects: TDraftRect[], isRow: boolean): TPoint[] => {
  const start = (rect: TDraftRect): number => (isRow ? rect.x : rect.y);
  const size = (rect: TDraftRect): number => (isRow ? rect.width : rect.height);
  const order = rects.map((_, index) => index).sort((a, b) => start(rects[a]) - start(rects[b]));
  const gap = getModeGap(
    order.slice(1).map((index, position) => start(rects[index]) - (start(rects[order[position]]) + size(rects[order[position]]))),
  );
  const targets: TPoint[] = rects.map((rect) => ({ x: rect.x, y: rect.y }));

  order.reduce((cursor, index) => {
    targets[index] = isRow ? { x: cursor, y: rects[index].y } : { x: rects[index].x, y: cursor };

    return cursor + size(rects[index]) + gap;
  }, start(rects[order[0]]));

  return targets;
};
