// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { isPointInRect } from './isPointInRect';

export const getFrameAtWorldPoint = (point: TPoint, renderOrderedNodes: TSceneNode[]): TFrameNode | null => {
  for (let index = renderOrderedNodes.length - 1; index >= 0; index -= 1) {
    const node = renderOrderedNodes[index];

    if (
      node.type === NodeType.frame &&
      node.rotation === 0 &&
      isPointInRect(point, { height: node.height, width: node.width, x: node.x, y: node.y })
    ) {
      return node;
    }
  }

  return null;
};
