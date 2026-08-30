// types
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { getRenderedVectorNode } from '../getRenderedVectorNode';
import { isPointInVectorRegions } from '../isPointInVectorRegions';
import { isPointNearVectorPath } from '../isPointNearVectorPath';

export const isPointOnVectorNode = (
  testPoint: TPoint,
  node: TVectorNode,
  lineTolerance: number,
  textPathBoundVectorIds: Set<string>,
): boolean => {
  if (textPathBoundVectorIds.has(node.id)) {
    return false;
  }

  const bakedNode = getRenderedVectorNode(node);

  return isPointInVectorRegions(testPoint, bakedNode) || isPointNearVectorPath(testPoint, bakedNode, lineTolerance);
};
