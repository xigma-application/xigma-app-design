// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getVectorEdgeAtPoint, TVectorEdgeMatch } from './getVectorEdgeAtPoint';
import { pickClosestVectorHitAcrossNodes } from './pickClosestVectorHitAcrossNodes';

export const getVectorEdgeAtPointAcrossOpenNodes = (
  point: TPoint,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  edgeTolerance: number,
  vertexTolerance: number,
): { hit: TVectorEdgeMatch; node: TVectorNode } | null =>
  pickClosestVectorHitAcrossNodes(
    vectorEditingNodeIds,
    nodes,
    (bakedNode) => getVectorEdgeAtPoint(point, bakedNode, edgeTolerance, vertexTolerance),
    (_bakedNode, hit) => Math.hypot(point.x - hit.point.x, point.y - hit.point.y),
  );
