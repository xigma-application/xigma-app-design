// types
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces, TVectorFace } from './deriveVectorFaces';
import { getVectorFillLoopKey } from './getVectorFillLoopKey';

export const getVectorFilledFacesTouchingVertexIds = (node: TVectorNode, vertexIds: string[]): TVectorFace[] => {
  const vertexIdSet = new Set(vertexIds);
  const incidentSegmentIds = new Set(
    Object.values(node.segments)
      .filter((segment) => vertexIdSet.has(segment.startId) || vertexIdSet.has(segment.endId))
      .map((segment) => segment.id),
  );

  return deriveVectorFaces(node).filter((face) => {
    const touchesDraggedVertex = face.pieceKeys.some((pieceKey) => incidentSegmentIds.has(pieceKey.split('[')[0]));
    return touchesDraggedVertex && node.filledFaceKeys.includes(getVectorFillLoopKey(face.pieceKeys));
  });
};
