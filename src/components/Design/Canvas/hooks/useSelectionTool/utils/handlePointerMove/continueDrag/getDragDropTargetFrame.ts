// store
import { getIsDescendantOfMovedNodes } from 'store/design/utils/handleMoveNodes/getIsDescendantOfMovedNodes';
import { isDropTargetContainer } from 'store/design/utils/nodeHierarchy/isDropTargetContainer';

// types
import { TSceneNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getUnrotatedQueryPoint } from 'components/Design/Canvas/utils/getUnrotatedQueryPoint';
import { isPointInRect } from 'components/Design/Canvas/utils/isPointInRect';

export const getDragDropTargetFrame = (
  movedNodeIds: string[],
  point: TPoint,
  renderOrderedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): string | null => {
  for (let index = renderOrderedNodes.length - 1; index >= 0; index -= 1) {
    const node = renderOrderedNodes[index];

    if (isDropTargetContainer(node) && !getIsDescendantOfMovedNodes(node.id, movedNodeIds, nodesById)) {
      const bounds = { height: node.height, width: node.width, x: node.x, y: node.y };

      if (isPointInRect(getUnrotatedQueryPoint(point, bounds, node.rotation), bounds)) {
        return node.id;
      }
    }
  }

  return null;
};
