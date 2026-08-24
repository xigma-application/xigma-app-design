// types
import { TVectorNode } from 'types/design/types';
import { TVectorFragment } from '../types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces';
import { getVectorFaceRealSegmentIds } from './getVectorFaceRealSegmentIds';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';

export const extractVectorFragment = (node: TVectorNode, vertexIds: string[], segmentIds: string[]): TVectorFragment => {
  const segmentEndpointIds = segmentIds.flatMap((id) => {
    const segment = node.segments[id];
    return segment ? [segment.startId, segment.endId] : [];
  });

  const vertexIdSet = new Set([...vertexIds, ...segmentEndpointIds]);

  const segmentIdSet = new Set([
    ...segmentIds,
    ...Object.entries(node.segments)
      .filter(([, segment]) => vertexIdSet.has(segment.startId) && vertexIdSet.has(segment.endId))
      .map(([id]) => id),
  ]);

  const filledFacePieceKeySets = deriveVectorFaces(node)
    .filter((face) => node.filledFaceKeys.includes(getVectorFillLoopKey(face.pieceKeys)))
    .filter((face) => {
      const realSegmentIds = getVectorFaceRealSegmentIds(face);
      return realSegmentIds.length > 0 && realSegmentIds.every((id) => segmentIdSet.has(id));
    })
    .map((face) => face.pieceKeys);

  return {
    filledFacePieceKeySets,
    segments: Array.from(segmentIdSet, (id) => node.segments[id]),
    vertexHandleModes: Object.fromEntries(
      Array.from(vertexIdSet)
        .filter((id) => node.vertexHandleModes[id])
        .map((id) => [id, node.vertexHandleModes[id]]),
    ),
    vertices: Array.from(vertexIdSet, (id) => node.vertices[id]),
  };
};
