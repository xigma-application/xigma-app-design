// types
import { TPoint } from 'types/canvas';
import { TVectorTangent } from 'types/design/types';

// utils
import { flattenSegment } from './flattenSegment';

export const getSegmentMidpoint = (start: TPoint, end: TPoint, tangentStart: TVectorTangent, tangentEnd: TVectorTangent): TPoint => {
  if (tangentStart || tangentEnd) {
    return flattenSegment(start, end, tangentStart, tangentEnd, 2)[1];
  }

  return { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
};
