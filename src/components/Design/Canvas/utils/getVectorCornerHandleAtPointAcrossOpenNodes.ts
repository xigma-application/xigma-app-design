// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorCornerHandleAtPoint } from './getVectorCornerHandleAtPoint';
import { pickClosestVectorHitAcrossNodes } from './pickClosestVectorHitAcrossNodes';

export const getVectorCornerHandleAtPointAcrossOpenNodes = (
  point: TPoint,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  tolerance: number,
): { node: TVectorNode; vertexId: string } | null => {
  const result = pickClosestVectorHitAcrossNodes(
    vectorEditingNodeIds,
    nodes,
    (bakedNode) => getVectorCornerHandleAtPoint(point, bakedNode, tolerance),
    (bakedNode, hit) => {
      const vertex = bakedNode.vertices[hit.vertexId];

      return Math.hypot(point.x - vertex.x, point.y - vertex.y);
    },
  );

  return result ? { node: result.node, vertexId: result.hit.vertexId } : null;
};
