// types
import { TPoint } from 'types/canvas';
import { TVectorTangent } from 'types/design/types';

export type TCubicBezierSplit = {
  firstTangentEnd: TVectorTangent;
  firstTangentStart: TVectorTangent;
  point: TPoint;
  secondTangentEnd: TVectorTangent;
  secondTangentStart: TVectorTangent;
};

const lerpPoint = (a: TPoint, b: TPoint, t: number): TPoint => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

const toOffset = (point: TPoint, origin: TPoint): TVectorTangent => {
  const x = point.x - origin.x;
  const y = point.y - origin.y;

  return x === 0 && y === 0 ? null : { x, y };
};

export const splitCubicBezier = (
  start: TPoint,
  end: TPoint,
  tangentStart: TVectorTangent,
  tangentEnd: TVectorTangent,
  t: number,
): TCubicBezierSplit => {
  if (!tangentStart && !tangentEnd) {
    return {
      firstTangentEnd: null,
      firstTangentStart: null,
      point: lerpPoint(start, end, t),
      secondTangentEnd: null,
      secondTangentStart: null,
    };
  }

  const controlStart = tangentStart ? { x: start.x + tangentStart.x, y: start.y + tangentStart.y } : start;
  const controlEnd = tangentEnd ? { x: end.x + tangentEnd.x, y: end.y + tangentEnd.y } : end;
  const a = lerpPoint(start, controlStart, t);
  const b = lerpPoint(controlStart, controlEnd, t);
  const c = lerpPoint(controlEnd, end, t);
  const d = lerpPoint(a, b, t);
  const e = lerpPoint(b, c, t);
  const point = lerpPoint(d, e, t);

  return {
    firstTangentEnd: toOffset(d, point),
    firstTangentStart: toOffset(a, start),
    point,
    secondTangentEnd: toOffset(c, end),
    secondTangentStart: toOffset(e, point),
  };
};
