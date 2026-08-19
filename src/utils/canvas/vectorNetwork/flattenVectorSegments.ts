// others
import { VECTOR_CURVE_SEGMENTS } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { flattenSegment } from './flattenSegment';

export type TFlattenedVectorSegment = { points: TPoint[]; segmentId: string };

const cache = new WeakMap<TVectorNode, TFlattenedVectorSegment[]>();

export const flattenVectorSegments = (node: TVectorNode): TFlattenedVectorSegment[] => {
  const cached = cache.get(node);

  if (cached) {
    return cached;
  }

  const flattened = Object.values(node.segments).map((segment) => ({
    points: flattenSegment(
      node.vertices[segment.startId],
      node.vertices[segment.endId],
      segment.tangentStart,
      segment.tangentEnd,
      VECTOR_CURVE_SEGMENTS,
    ),
    segmentId: segment.id,
  }));

  cache.set(node, flattened);

  return flattened;
};
