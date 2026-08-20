// types
import { TVectorCornerHandleDragCandidate } from 'types/design/selectionTool/types';
import { TVectorNode, TVectorSegment } from 'types/design/types';

// utils
import { getAngleBetweenPoints } from 'utils/math/getAngleBetweenPoints';

export const getVectorCornerHandleDragCandidates = (
  touchingSegments: TVectorSegment[],
  vertexId: string,
  node: TVectorNode,
): TVectorCornerHandleDragCandidate[] =>
  touchingSegments.map((segment) => {
    const end: 'end' | 'start' = segment.endId === vertexId ? 'end' : 'start';
    const otherVertexId = end === 'end' ? segment.startId : segment.endId;

    return { angle: getAngleBetweenPoints(node.vertices[vertexId], node.vertices[otherVertexId]), end, segmentId: segment.id };
  });
