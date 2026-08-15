// types
import { TDraftRect } from 'types/canvas';

// utils
import { getRectCorners } from './getRectCorners';
import { rotatePoint } from 'utils/math/rotatePoint';

export const getRotatedBoundingBox = (rect: TDraftRect, rotation: number): TDraftRect => {
  const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  const corners = getRectCorners(rect).map((corner) => rotatePoint(corner, center, rotation));
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  return { height: Math.max(...ys) - minY, width: Math.max(...xs) - minX, x: minX, y: minY };
};
