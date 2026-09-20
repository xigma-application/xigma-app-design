// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export const getRotatedCorners = (bounds: TDraftRect, rotation: number): TPoint[] => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

  return [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y },
    { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    { x: bounds.x, y: bounds.y + bounds.height },
  ].map((corner) => rotatePoint(corner, center, rotation));
};
