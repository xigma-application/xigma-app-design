// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { flattenSegment } from '../flattenSegment';
import { getVectorCurveSegmentCount } from '../getVectorCurveSegmentCount';

export const flattenForCrossingSearch = (segment: TVectorSegment, vertices: Record<string, TVectorVertex>): TPoint[] => {
  const start = vertices[segment.startId];
  const end = vertices[segment.endId];

  return flattenSegment(
    start,
    end,
    segment.tangentStart,
    segment.tangentEnd,
    getVectorCurveSegmentCount(start, end, segment.tangentStart, segment.tangentEnd),
  );
};
