// types
import { TVectorNode } from 'types/design/types';
import { TVectorFragment } from '../../types';

// utils
import { getExpandedSegmentIdSet } from './getExpandedSegmentIdSet';
import { getFilledFacePieceKeySets } from './getFilledFacePieceKeySets';
import { getVertexIdSet } from './getVertexIdSet';

export const extractVectorFragment = (node: TVectorNode, vertexIds: string[], segmentIds: string[]): TVectorFragment => {
  const vertexIdSet = getVertexIdSet(node, vertexIds, segmentIds);
  const segmentIdSet = getExpandedSegmentIdSet(node, segmentIds, vertexIdSet);

  return {
    filledFacePieceKeySets: getFilledFacePieceKeySets(node, segmentIdSet),
    segments: Array.from(segmentIdSet, (id) => node.segments[id]),
    vertexHandleModes: Object.fromEntries(
      Array.from(vertexIdSet)
        .filter((id) => node.vertexHandleModes[id])
        .map((id) => [id, node.vertexHandleModes[id]]),
    ),
    vertices: Array.from(vertexIdSet, (id) => node.vertices[id]),
  };
};
