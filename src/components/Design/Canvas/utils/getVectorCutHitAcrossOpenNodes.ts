// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from './bakeVectorNodeRotation';
import { getVectorCutHitAtPoint, TVectorCutHit } from './getVectorCutHitAtPoint';
import { getVectorEditingNode } from './getVectorEditingNode';

export const getVectorCutHitAcrossOpenNodes = (
  point: TPoint,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  edgeTolerance: number,
  vertexTolerance: number,
): { hit: TVectorCutHit; node: TVectorNode } | null => {
  const candidates = vectorEditingNodeIds
    .map((nodeId) => getVectorEditingNode(nodes, nodeId))
    .filter((node): node is TVectorNode => node !== null)
    .map((node) => {
      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
      const hit = getVectorCutHitAtPoint(point, bakedNode, edgeTolerance, vertexTolerance);

      return hit ? { distance: Math.hypot(point.x - hit.point.x, point.y - hit.point.y), hit, node } : null;
    })
    .filter((candidate): candidate is { distance: number; hit: TVectorCutHit; node: TVectorNode } => candidate !== null)
    .sort((a, b) => a.distance - b.distance);

  return candidates.length > 0 ? { hit: candidates[0].hit, node: candidates[0].node } : null;
};
