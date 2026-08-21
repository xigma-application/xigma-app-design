// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';
import { TPlanarVectorNetwork } from './types';

// utils
import { buildPlanarSegments } from './buildPlanarSegments';
import { findAllNetworkCrossings } from './findAllNetworkCrossings';

export const planarizeVectorNetwork = (segments: TVectorSegment[], vertices: Record<string, TVectorVertex>): TPlanarVectorNetwork => {
  const { crossingsBySegmentId, virtualVertices } = findAllNetworkCrossings(segments, vertices);

  if (crossingsBySegmentId.size === 0) {
    return { segments: Object.fromEntries(segments.map((segment) => [segment.id, segment])), vertices };
  }

  return {
    segments: buildPlanarSegments(segments, vertices, crossingsBySegmentId),
    vertices: { ...vertices, ...virtualVertices },
  };
};
