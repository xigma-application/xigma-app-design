// store
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

export const markNewVectorCutVertices = (canvasRefs: TCanvasRefs, beforeNodes: Record<string, TSceneNode>, nodeIds: string[]): void => {
  const afterNodes = store.getState().design.nodes;

  nodeIds.forEach((nodeId) => {
    const beforeNode = beforeNodes[nodeId] as TVectorNode | undefined;
    const afterNode = afterNodes[nodeId] as TVectorNode | undefined;

    if (beforeNode && afterNode) {
      const beforeVertexIds = new Set(Object.keys(beforeNode.vertices));

      Object.keys(afterNode.vertices).forEach((vertexId) => {
        if (!beforeVertexIds.has(vertexId)) {
          canvasRefs.newVectorCutVertexIdsRef.current.add(vertexId);
        }
      });
    }
  });
};
