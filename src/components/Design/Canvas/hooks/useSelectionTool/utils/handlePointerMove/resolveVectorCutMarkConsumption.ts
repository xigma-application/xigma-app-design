// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';

const findVectorVertexPosition = (nodes: Record<string, TSceneNode>, nodeIds: string[], vertexId: string): TPoint | null => {
  for (const nodeId of nodeIds) {
    const vertex = (nodes[nodeId] as TVectorNode | undefined)?.vertices[vertexId];

    if (vertex) {
      return { x: vertex.x, y: vertex.y };
    }
  }

  return null;
};

export const resolveVectorCutMarkConsumption = (canvasRefs: TCanvasRefs): void => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (vectorEditingNodeIds.length === 0) {
    canvasRefs.newVectorCutVertexIdsRef.current.clear();
    canvasRefs.touchedVectorCutVertexIdsRef.current.clear();
    return;
  }

  const selected = new Set(canvasRefs.selectedVectorVertexIdsRef.current);
  const newIds = canvasRefs.newVectorCutVertexIdsRef.current;
  const touchedIds = canvasRefs.touchedVectorCutVertexIdsRef.current;

  newIds.forEach((vertexId) => {
    if (selected.has(vertexId)) {
      touchedIds.add(vertexId);
    }
  });

  touchedIds.forEach((vertexId) => {
    if (!selected.has(vertexId)) {
      const position = findVectorVertexPosition(state.design.nodes, vectorEditingNodeIds, vertexId);

      newIds.forEach((otherId) => {
        const otherPosition = findVectorVertexPosition(state.design.nodes, vectorEditingNodeIds, otherId);

        if (position && otherPosition && position.x === otherPosition.x && position.y === otherPosition.y) {
          newIds.delete(otherId);
          touchedIds.delete(otherId);
        }
      });
    }
  });
};
