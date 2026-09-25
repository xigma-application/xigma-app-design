// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { isClickThroughFrame } from 'store/design/utils/nodeHierarchy/isClickThroughFrame';
import { isPointOnNodeNameLabel } from '../../../../../utils/isPointOnNodeNameLabel';

export const shouldDrillIntoSelectedFrame = (
  node: TSceneNode,
  nodesById: Record<string, TSceneNode>,
  point: TPoint,
  zoom: number,
): boolean => {
  if ((node.type === NodeType.frame || node.type === NodeType.section) && node.childIds.length > 0) {
    return isClickThroughFrame(node, nodesById) ? !isPointOnNodeNameLabel(point, node, zoom, nodesById) : true;
  }

  return false;
};
