// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';
import { TPlanarVectorNetwork } from './types';

// utils
import { buildPlanarSegments } from './buildPlanarSegments';
import { findAllNetworkCrossings } from './findAllNetworkCrossings/findAllNetworkCrossings';

export const planarizeVectorNetwork = (
  nodeId: string | null,
  segmentsRecord: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
): TPlanarVectorNetwork => {
  const segments = Object.values(segmentsRecord);
  const { crossingsBySegmentId, virtualVertices } = findAllNetworkCrossings(nodeId, segments, vertices);

  if (crossingsBySegmentId.size === 0) {
    return { segments: segmentsRecord, vertices };
  }

  return {
    segments: buildPlanarSegments(segments, vertices, crossingsBySegmentId),
    vertices: { ...vertices, ...virtualVertices },
  };
};
