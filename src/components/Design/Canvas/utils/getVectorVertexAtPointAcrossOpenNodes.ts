// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorVertexAtPoint } from './getVectorVertexAtPoint';
import { pickClosestVectorHitAcrossNodes } from './pickClosestVectorHitAcrossNodes';

export const getVectorVertexAtPointAcrossOpenNodes = (
  point: TPoint,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  tolerance: number,
  excludeVertexId?: string | null,
): { node: TVectorNode; vertexId: string } | null => {
  const result = pickClosestVectorHitAcrossNodes(
    vectorEditingNodeIds,
    nodes,
    (bakedNode) => getVectorVertexAtPoint(point, bakedNode, tolerance, excludeVertexId),
    (bakedNode, hit) => {
      const vertex = bakedNode.vertices[hit.vertexId];
      return Math.hypot(point.x - vertex.x, point.y - vertex.y);
    },
  );

  return result ? { node: result.node, vertexId: result.hit.vertexId } : null;
};
