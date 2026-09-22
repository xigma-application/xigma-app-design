// types
import { TDraftRect } from 'types/canvas';

export const unionRects = (a: TDraftRect | null, b: TDraftRect): TDraftRect => {
  if (a) {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const right = Math.max(a.x + a.width, b.x + b.width);
    const bottom = Math.max(a.y + a.height, b.y + b.height);

    return { height: bottom - y, width: right - x, x, y };
  }

  return b;
};
