// types
import { TPoint } from 'types/canvas';

const getCubicPoint = (start: TPoint, control1: TPoint, control2: TPoint, end: TPoint, t: number): TPoint => {
  const inverse = 1 - t;
  const a = inverse * inverse * inverse;
  const b = 3 * inverse * inverse * t;
  const c = 3 * inverse * t * t;
  const d = t * t * t;

  return {
    x: a * start.x + b * control1.x + c * control2.x + d * end.x,
    y: a * start.y + b * control1.y + c * control2.y + d * end.y,
  };
};

export const getCornerFilletPoints = (
  start: TPoint,
  startDirection: TPoint,
  end: TPoint,
  endDirection: TPoint,
  tangentLength: number,
  segments: number,
): TPoint[] => {
  const turn = Math.acos(Math.min(Math.max(startDirection.x * endDirection.x + startDirection.y * endDirection.y, -1), 1));
  const radius = tangentLength / Math.tan(turn / 2);
  const handle = (4 / 3) * Math.tan(turn / 4) * radius;
  const control1 = { x: start.x + startDirection.x * handle, y: start.y + startDirection.y * handle };
  const control2 = { x: end.x - endDirection.x * handle, y: end.y - endDirection.y * handle };

  return Array.from({ length: segments - 1 }, (_, index) => getCubicPoint(start, control1, control2, end, (index + 1) / segments));
};
