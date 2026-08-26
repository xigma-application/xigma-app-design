// types
import { TFlattenedVectorSegment } from './flattenVectorSegments';
import { TVectorNode, TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { flattenSegment } from './flattenSegment';
import { getVectorCurveSegmentCount } from './getVectorCurveSegmentCount';

type TCacheEntry = { endVertex: TVectorVertex; flattened: TFlattenedVectorSegment; startVertex: TVectorVertex };

const cache = new WeakMap<TVectorSegment, TCacheEntry>();

export const flattenVectorSegmentById = (node: TVectorNode, segmentId: string): TFlattenedVectorSegment | null => {
  const segment = node.segments[segmentId];

  if (segment) {
    const startVertex = node.vertices[segment.startId];
    const endVertex = node.vertices[segment.endId];
    const cached = cache.get(segment);

    if (cached && cached.startVertex === startVertex && cached.endVertex === endVertex) {
      return cached.flattened;
    }

    const flattened: TFlattenedVectorSegment = {
      endId: segment.endId,
      points: flattenSegment(
        startVertex,
        endVertex,
        segment.tangentStart,
        segment.tangentEnd,
        getVectorCurveSegmentCount(startVertex, endVertex, segment.tangentStart, segment.tangentEnd),
      ),
      segmentId: segment.id,
      startId: segment.startId,
    };

    cache.set(segment, { endVertex, flattened, startVertex });

    return flattened;
  }

  return null;
};
