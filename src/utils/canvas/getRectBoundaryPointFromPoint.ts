// types
import { TDraftRect, TPoint } from 'types/canvas';

const DIRECTION_EPSILON = 1e-9;

const getAxisScale = (direction: number, originValue: number, lowBound: number, highBound: number): number => {
  switch (true) {
    case direction > DIRECTION_EPSILON:
      return (highBound - originValue) / direction;
    case direction < -DIRECTION_EPSILON:
      return (lowBound - originValue) / direction;
    default:
      return Infinity;
  }
};

export const getRectBoundaryPointFromPoint = (origin: TPoint, angle: number, bounds: TDraftRect): TPoint => {
  const directionX = Math.cos(angle);
  const directionY = Math.sin(angle);
  const left = bounds.x;
  const right = bounds.x + bounds.width;
  const top = bounds.y;
  const bottom = bounds.y + bounds.height;
  const scaleX = getAxisScale(directionX, origin.x, left, right);
  const scaleY = getAxisScale(directionY, origin.y, top, bottom);
  const scale = Math.min(scaleX, scaleY);

  return { x: origin.x + directionX * scale, y: origin.y + directionY * scale };
};
