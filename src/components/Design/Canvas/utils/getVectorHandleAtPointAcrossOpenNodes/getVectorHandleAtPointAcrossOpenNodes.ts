// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorHandleHitDistance } from './getVectorHandleHitDistance';
import { getVectorHandleHitForNode } from './getVectorHandleHitForNode';
import { pickClosestVectorHitAcrossNodes } from '../pickClosestVectorHitAcrossNodes';
import { TVectorHandleHit } from '../getVectorHandleAtPoint';

export const getVectorHandleAtPointAcrossOpenNodes = (
  point: TPoint,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  tolerance: number,
  visualSelectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  selectedSegmentIds: string[],
): { hit: TVectorHandleHit; node: TVectorNode } | null => {
  const result = pickClosestVectorHitAcrossNodes(
    vectorEditingNodeIds,
    nodes,
    (bakedNode) => getVectorHandleHitForNode(bakedNode, point, tolerance, visualSelectedVertexIds, selectedHandles, selectedSegmentIds),
    (bakedNode, hit) => getVectorHandleHitDistance(bakedNode, hit, point),
  );

  return result
    ? { hit: { end: result.hit.end, segmentId: result.hit.segmentId, vertexId: result.hit.vertexId }, node: result.node }
    : null;
};
