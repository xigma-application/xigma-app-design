// others
import { VECTOR_CURVE_MAX_SEGMENTS, VECTOR_CURVE_MIN_SEGMENTS, VECTOR_CURVE_SEGMENT_WORLD_LENGTH } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TVectorTangent } from 'types/design/types';

const getDistance = (a: TPoint, b: TPoint): number => Math.hypot(b.x - a.x, b.y - a.y);

export const getVectorCurveSegmentCount = (
  start: TPoint,
  end: TPoint,
  tangentAtStart: TVectorTangent,
  tangentAtEnd: TVectorTangent,
): number => {
  const controlStart = tangentAtStart ? { x: start.x + tangentAtStart.x, y: start.y + tangentAtStart.y } : start;
  const controlEnd = tangentAtEnd ? { x: end.x + tangentAtEnd.x, y: end.y + tangentAtEnd.y } : end;
  const controlPolygonLength = getDistance(start, controlStart) + getDistance(controlStart, controlEnd) + getDistance(controlEnd, end);

  return Math.min(
    VECTOR_CURVE_MAX_SEGMENTS,
    Math.max(VECTOR_CURVE_MIN_SEGMENTS, Math.ceil(controlPolygonLength / VECTOR_CURVE_SEGMENT_WORLD_LENGTH)),
  );
};
