// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getRectBoundaryPointFromPoint } from './getRectBoundaryPointFromPoint';

export const getRectPerimeterPointAtAngle = (bounds: TDraftRect, angle: number): TPoint => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  return getRectBoundaryPointFromPoint(center, angle, bounds);
};
