// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getUnrotatedNodeQueryPoint } from './getUnrotatedNodeQueryPoint';
import { isPointInRect } from '../isPointInRect';

export const isPointClippedFromNode = (point: TPoint, node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean => {
  let ancestor = node.parentId ? nodesById[node.parentId] : undefined;

  while (ancestor) {
    if (ancestor.type === NodeType.frame && ancestor.clipContent && !isPointInRect(getUnrotatedNodeQueryPoint(point, ancestor), ancestor)) {
      return true;
    }

    ancestor = ancestor.parentId ? nodesById[ancestor.parentId] : undefined;
  }

  return false;
};
