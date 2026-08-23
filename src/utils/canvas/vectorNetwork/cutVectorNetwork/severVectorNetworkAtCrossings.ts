// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';
import { TLineNetworkCrossing } from './types';

// utils
import { severSegmentAtCrossings } from './severSegmentAtCrossings';

export const severVectorNetworkAtCrossings = (
  segments: Record<string, TVectorSegment>,
  vertices: Record<string, TVectorVertex>,
  crossings: TLineNetworkCrossing[],
): { segments: Record<string, TVectorSegment>; vertexLineT: Record<string, number>; vertices: Record<string, TVectorVertex> } => {
  const crossingsBySegmentId = new Map<string, TLineNetworkCrossing[]>();

  crossings.forEach((crossing) => {
    crossingsBySegmentId.set(crossing.segmentId, [...(crossingsBySegmentId.get(crossing.segmentId) ?? []), crossing]);
  });

  const resultSegments: Record<string, TVectorSegment> = {};
  let resultVertices: Record<string, TVectorVertex> = { ...vertices };
  let resultVertexLineT: Record<string, number> = {};

  Object.values(segments).forEach((segment) => {
    const segmentCrossings = crossingsBySegmentId.get(segment.id);

    if (segmentCrossings) {
      const sortedCrossings = [...segmentCrossings].sort((a, b) => a.t - b.t);
      const severed = severSegmentAtCrossings(segment, vertices, sortedCrossings);

      Object.assign(resultSegments, severed.segments);
      resultVertices = { ...resultVertices, ...severed.vertices };
      resultVertexLineT = { ...resultVertexLineT, ...severed.vertexLineT };
    } else {
      resultSegments[segment.id] = segment;
    }
  });

  return { segments: resultSegments, vertexLineT: resultVertexLineT, vertices: resultVertices };
};
