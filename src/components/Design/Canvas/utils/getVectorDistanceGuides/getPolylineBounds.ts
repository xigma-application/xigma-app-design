// types
import { TDraftRect, TPoint } from 'types/canvas';

export const getPolylineBounds = (polyline: TPoint[]): TDraftRect => {
  const xs = polyline.map((point) => point.x);
  const ys = polyline.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return { height: maxY - minY, width: maxX - minX, x: minX, y: minY };
};
