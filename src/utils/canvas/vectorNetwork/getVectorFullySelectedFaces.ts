// types
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces, TVectorFace } from './deriveVectorFaces';
import { getVectorFaceVertexIds } from './getVectorFaceVertexIds';
import { getVectorFillLoopKey } from './getVectorFillLoopKey';

export const getVectorFullySelectedFaces = (node: TVectorNode, selectedVertexIds: string[]): TVectorFace[] => {
  const selectedSet = new Set(selectedVertexIds);

  return deriveVectorFaces(node).filter((face) => {
    const vertexIds = getVectorFaceVertexIds(face);

    return (
      vertexIds.length > 0 &&
      vertexIds.every((id) => selectedSet.has(id)) &&
      node.filledFaceKeys.includes(getVectorFillLoopKey(face.pieceKeys))
    );
  });
};
