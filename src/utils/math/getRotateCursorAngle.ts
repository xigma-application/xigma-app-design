// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { rotatePoint } from './rotatePoint';

export const getRotateCursorAngle = (point: TPoint, bounds: TDraftRect, rotation: number): number => {
  const center: TPoint = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const localPoint = rotation === 0 ? point : rotatePoint(point, center, -rotation);
  const dx = localPoint.x - center.x;
  const dy = localPoint.y - center.y;

  switch (true) {
    case dx >= 0 && dy < 0:
      return rotation;
    case dx >= 0 && dy >= 0:
      return 90 + rotation;
    case dx < 0 && dy >= 0:
      return 180 + rotation;
    default:
      return 270 + rotation;
  }
};
