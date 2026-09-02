// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getPointsBounds = (points: TPoint[]): TDraftRect | null => {
  if (points.length !== 0) {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return { height: maxY - minY, width: maxX - minX, x: minX, y: minY };
  }

  return null;
};
