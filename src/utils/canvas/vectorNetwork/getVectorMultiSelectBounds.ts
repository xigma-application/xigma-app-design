// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getVectorMultiSelectBounds = (points: TPoint[]): TDraftRect | null => {
  if (points.length !== 0) {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);

    return { height: Math.max(...ys) - minY, width: Math.max(...xs) - minX, x: minX, y: minY };
  }

  return null;
};
