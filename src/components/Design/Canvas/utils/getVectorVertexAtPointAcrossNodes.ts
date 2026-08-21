// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from './bakeVectorNodeRotation';

export const getVectorVertexAtPointAcrossNodes = (
  point: TPoint,
  nodes: Record<string, TSceneNode>,
  tolerance: number,
  excludeVertexId: string,
): { nodeId: string; point: TPoint; vertexId: string } | null => {
  const candidates = Object.values(nodes)
    .filter((node): node is Extract<TSceneNode, { type: NodeType.vector }> => node.type === NodeType.vector)
    .flatMap((node) => Object.values(bakeVectorNodeRotation(node).vertices).map((vertex) => ({ nodeId: node.id, vertex })))
    .filter(({ vertex }) => vertex.id !== excludeVertexId)
    .map(({ nodeId, vertex }) => ({
      distance: Math.hypot(point.x - vertex.x, point.y - vertex.y),
      nodeId,
      point: { x: vertex.x, y: vertex.y },
      vertexId: vertex.id,
    }))
    .filter((candidate) => candidate.distance <= tolerance)
    .sort((a, b) => a.distance - b.distance);

  return candidates.length > 0 ? { nodeId: candidates[0].nodeId, point: candidates[0].point, vertexId: candidates[0].vertexId } : null;
};
