// types
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from './bakeVectorNodeRotation';
import { getVectorEditingNode } from './getVectorEditingNode';

export const pickClosestVectorHitAcrossNodes = <THit>(
  nodeIds: string[],
  nodes: Record<string, TSceneNode>,
  hitTest: (bakedNode: TVectorNode) => THit | null,
  getDistance: (bakedNode: TVectorNode, hit: THit) => number,
): { hit: THit; node: TVectorNode } | null => {
  const candidates = nodeIds
    .map((nodeId) => getVectorEditingNode(nodes, nodeId))
    .filter((node): node is TVectorNode => node !== null)
    .map((node) => {
      const bakedNode = { ...node, ...bakeVectorNodeRotation(node) };
      const hit = hitTest(bakedNode);

      return hit ? { distance: getDistance(bakedNode, hit), hit, node } : null;
    })
    .filter((candidate): candidate is { distance: number; hit: NonNullable<THit>; node: TVectorNode } => candidate !== null)
    .sort((a, b) => a.distance - b.distance);

  return candidates.length > 0 ? { hit: candidates[0].hit, node: candidates[0].node } : null;
};
