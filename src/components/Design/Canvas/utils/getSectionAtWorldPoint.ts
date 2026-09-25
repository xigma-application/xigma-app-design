// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TSectionNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getUnrotatedQueryPoint } from './getUnrotatedQueryPoint';
import { isPointInRect } from './isPointInRect';

export const getSectionAtWorldPoint = (point: TPoint, renderOrderedNodes: TSceneNode[]): TSectionNode | null => {
  for (let index = renderOrderedNodes.length - 1; index >= 0; index -= 1) {
    const node = renderOrderedNodes[index];

    if (node.type === NodeType.section) {
      const bounds = { height: node.height, width: node.width, x: node.x, y: node.y };

      if (isPointInRect(getUnrotatedQueryPoint(point, bounds, node.rotation), bounds)) {
        return node;
      }
    }
  }

  return null;
};
