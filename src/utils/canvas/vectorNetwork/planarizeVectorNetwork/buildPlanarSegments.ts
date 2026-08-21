// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';
import { TSegmentCrossing } from './types';

// utils
import { splitSegmentAtCrossings } from './splitSegmentAtCrossings';

export const buildPlanarSegments = (
  segments: TVectorSegment[],
  vertices: Record<string, TVectorVertex>,
  crossingsBySegmentId: Map<string, TSegmentCrossing[]>,
): Record<string, TVectorSegment> => {
  const planarSegments: Record<string, TVectorSegment> = {};

  segments.forEach((segment) => {
    const crossings = crossingsBySegmentId.get(segment.id);

    if (crossings) {
      Object.assign(
        planarSegments,
        splitSegmentAtCrossings(
          segment,
          vertices,
          [...crossings].sort((a, b) => a.t - b.t),
        ),
      );
    } else {
      planarSegments[segment.id] = segment;
    }
  });

  return planarSegments;
};
