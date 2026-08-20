// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { flattenSegment } from './flattenSegment';
import { getVectorCurveSegmentCount } from './getVectorCurveSegmentCount';

export type TFlattenedVectorSegment = { points: TPoint[]; segmentId: string };

const cache = new WeakMap<TVectorNode, TFlattenedVectorSegment[]>();

export const flattenVectorSegments = (node: TVectorNode): TFlattenedVectorSegment[] => {
  const cached = cache.get(node);

  if (cached) {
    return cached;
  }

  const flattened = Object.values(node.segments).map((segment) => {
    const start = node.vertices[segment.startId];
    const end = node.vertices[segment.endId];

    return {
      points: flattenSegment(
        start,
        end,
        segment.tangentStart,
        segment.tangentEnd,
        getVectorCurveSegmentCount(start, end, segment.tangentStart, segment.tangentEnd),
      ),
      segmentId: segment.id,
    };
  });

  cache.set(node, flattened);

  return flattened;
};
