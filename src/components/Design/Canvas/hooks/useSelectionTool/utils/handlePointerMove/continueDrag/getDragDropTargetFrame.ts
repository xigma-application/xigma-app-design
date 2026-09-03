// store
import { getIsDescendantOfMovedNodes } from 'store/design/utils/handleMoveNodes/getIsDescendantOfMovedNodes';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { isPointInRect } from 'components/Design/Canvas/utils/isPointInRect';

export const getDragDropTargetFrame = (
  movedNodeIds: string[],
  point: TPoint,
  renderOrderedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): string | null => {
  for (let index = renderOrderedNodes.length - 1; index >= 0; index -= 1) {
    const node = renderOrderedNodes[index];

    if (
      node.type === NodeType.frame &&
      node.rotation === 0 &&
      isPointInRect(point, { height: node.height, width: node.width, x: node.x, y: node.y }) &&
      !getIsDescendantOfMovedNodes(node.id, movedNodeIds, nodesById)
    ) {
      return node.id;
    }
  }

  return null;
};
