// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from './bakeVectorNodeRotation';
import { getVectorVertexAtPoint } from './getVectorVertexAtPoint';

type TCandidate = { distance: number; nodeId: string; point: TPoint; vertexId: string };

export const getVectorVertexAtPointAcrossNodes = (
  point: TPoint,
  nodes: Record<string, TSceneNode>,
  tolerance: number,
  excludeVertexId: string,
): { nodeId: string; point: TPoint; vertexId: string } | null => {
  const candidates = Object.values(nodes)
    .filter((node): node is Extract<TSceneNode, { type: NodeType.vector }> => node.type === NodeType.vector)
    .map((node): TCandidate | null => {
      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
      const hit = getVectorVertexAtPoint(point, bakedNode, tolerance, excludeVertexId);

      if (hit) {
        const vertex = bakedNode.vertices[hit.vertexId];

        return {
          distance: Math.hypot(point.x - vertex.x, point.y - vertex.y),
          nodeId: node.id,
          point: { x: vertex.x, y: vertex.y },
          vertexId: hit.vertexId,
        };
      }

      return null;
    })
    .filter((candidate): candidate is TCandidate => candidate !== null)
    .sort((a, b) => a.distance - b.distance);

  return candidates.length > 0 ? { nodeId: candidates[0].nodeId, point: candidates[0].point, vertexId: candidates[0].vertexId } : null;
};
