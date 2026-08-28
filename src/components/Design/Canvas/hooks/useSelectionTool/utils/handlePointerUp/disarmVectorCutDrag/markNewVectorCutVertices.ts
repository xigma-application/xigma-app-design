// store
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

const collectVectorVertexIds = (nodes: Record<string, TSceneNode>, nodeIds: string[]): Set<string> => {
  const vertexIds = new Set<string>();

  nodeIds.forEach((nodeId) => {
    const node = nodes[nodeId] as TVectorNode | undefined;

    if (node) {
      Object.keys(node.vertices).forEach((vertexId) => vertexIds.add(vertexId));
    }
  });

  return vertexIds;
};

export const markNewVectorCutVertices = (
  canvasRefs: TCanvasRefs,
  beforeNodes: Record<string, TSceneNode>,
  beforeNodeIds: string[],
  afterNodeIds: string[],
): void => {
  const afterNodes = store.getState().design.nodes;
  const beforeVertexIds = collectVectorVertexIds(beforeNodes, beforeNodeIds);
  const afterVertexIds = collectVectorVertexIds(afterNodes, afterNodeIds);

  afterVertexIds.forEach((vertexId) => {
    if (!beforeVertexIds.has(vertexId)) {
      canvasRefs.vectorCut.newVectorCutVertexIdsRef.current.add(vertexId);
    }
  });
};
