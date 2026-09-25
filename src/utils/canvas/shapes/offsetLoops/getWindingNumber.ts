// types
import { TPoint } from 'types/canvas';

const isLeft = (from: TPoint, to: TPoint, point: TPoint): number =>
  (to.x - from.x) * (point.y - from.y) - (point.x - from.x) * (to.y - from.y);

export const getWindingNumber = (point: TPoint, loop: TPoint[]): number =>
  loop.reduce((winding, from, index) => {
    const to = loop[(index + 1) % loop.length];

    if (from.y <= point.y) {
      return to.y > point.y && isLeft(from, to, point) > 0 ? winding + 1 : winding;
    }

    return to.y <= point.y && isLeft(from, to, point) < 0 ? winding - 1 : winding;
  }, 0);
