// types
import { TVectorDraggedFillFaces } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { findVectorEditingNodeForVertex } from '../../../../utils/findVectorEditingNodeForVertex';
import { getVectorFilledFacesTouchingVertexIds } from 'utils/canvas/vectorNetwork/getVectorFilledFacesTouchingVertexIds';

export const getVectorDraggedFillFaces = (
  nodes: Record<string, TSceneNode>,
  vectorEditingNodeIds: string[],
  vertexIds: string[],
): TVectorDraggedFillFaces | null => {
  const vertexIdsByNodeId = vertexIds.reduce<Record<string, string[]>>((acc, vertexId) => {
    const node = findVectorEditingNodeForVertex(vectorEditingNodeIds, nodes, vertexId);

    if (node) {
      acc[node.id] = [...(acc[node.id] ?? []), vertexId];
    }

    return acc;
  }, {});

  const entries = Object.entries(vertexIdsByNodeId).flatMap(([nodeId, ids]) => {
    const faceKeys = getVectorFilledFacesTouchingVertexIds(nodes[nodeId] as TVectorNode, ids).map((face) => face.key);

    return faceKeys.length ? [[nodeId, faceKeys] as const] : [];
  });

  return entries.length ? Object.fromEntries(entries) : null;
};
