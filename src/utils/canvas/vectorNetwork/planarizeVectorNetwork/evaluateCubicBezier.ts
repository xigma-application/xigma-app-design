// types
import { TPoint } from 'types/canvas';
import { TVectorSegment } from 'types/design/types';

export const evaluateCubicBezier = (
  start: TPoint,
  end: TPoint,
  tangentStart: TVectorSegment['tangentStart'],
  tangentEnd: TVectorSegment['tangentEnd'],
  t: number,
): TPoint => {
  if (!tangentStart && !tangentEnd) {
    return { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t };
  }

  const controlStart = tangentStart ? { x: start.x + tangentStart.x, y: start.y + tangentStart.y } : start;
  const controlEnd = tangentEnd ? { x: end.x + tangentEnd.x, y: end.y + tangentEnd.y } : end;
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;

  return {
    x: a * start.x + b * controlStart.x + c * controlEnd.x + d * end.x,
    y: a * start.y + b * controlStart.y + c * controlEnd.y + d * end.y,
  };
};
