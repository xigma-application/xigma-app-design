// types
import { TVectorSegment, TVectorVertex } from 'types/design/types';

// utils
import { getVertexParamOnStraightSegment } from './getVertexParamOnStraightSegment';
import { isStraightVectorSegment } from './isStraightVectorSegment';

export const splitStraightSegmentAtVertices = (
  segment: TVectorSegment,
  vertices: Record<string, TVectorVertex>,
  vertexList: TVectorVertex[],
): TVectorSegment[] => {
  const start = vertices[segment.startId];
  const end = vertices[segment.endId];

  if (!isStraightVectorSegment(segment) || !start || !end) {
    return [segment];
  }

  const splitIds = vertexList
    .map((vertex) => ({ id: vertex.id, t: getVertexParamOnStraightSegment(start, end, vertex) }))
    .filter((entry): entry is { id: string; t: number } => entry.t !== null)
    .sort((entryA, entryB) => entryA.t - entryB.t)
    .map((entry) => entry.id);
  const chainIds = [segment.startId, ...splitIds, segment.endId];

  return chainIds.slice(1).map((endId, index) => ({
    ...segment,
    endId,
    id: index === 0 && splitIds.length === 0 ? segment.id : `${segment.id}-${index}`,
    startId: chainIds[index],
  }));
};
