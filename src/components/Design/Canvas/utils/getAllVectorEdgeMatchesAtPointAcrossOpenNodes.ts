// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from './bakeVectorNodeRotation';
import { getAllVectorEdgeMatchesAtPoint, TVectorEdgeMatch } from './getVectorEdgeAtPoint';
import { getVectorEditingNode } from './getVectorEditingNode';

export const getAllVectorEdgeMatchesAtPointAcrossOpenNodes = (
  point: TPoint,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  edgeTolerance: number,
  vertexTolerance: number,
): { matches: TVectorEdgeMatch[]; node: TVectorNode } | null => {
  const candidates = vectorEditingNodeIds
    .map((nodeId) => getVectorEditingNode(nodes, nodeId))
    .filter((node): node is TVectorNode => node !== null)
    .map((node) => {
      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
      const matches = getAllVectorEdgeMatchesAtPoint(point, bakedNode, edgeTolerance, vertexTolerance);
      const closestDistance = Math.min(...matches.map((match) => Math.hypot(point.x - match.point.x, point.y - match.point.y)));

      return matches.length > 0 ? { closestDistance, matches, node } : null;
    })
    .filter((candidate): candidate is { closestDistance: number; matches: TVectorEdgeMatch[]; node: TVectorNode } => candidate !== null)
    .sort((a, b) => a.closestDistance - b.closestDistance);

  return candidates.length > 0 ? { matches: candidates[0].matches, node: candidates[0].node } : null;
};
