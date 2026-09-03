// store
import { getIsDescendantOfMovedNodes } from 'store/design/utils/handleMoveNodes/getIsDescendantOfMovedNodes';

// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TSectionNode, TSceneNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getUnrotatedQueryPoint } from 'components/Design/Canvas/utils/getUnrotatedQueryPoint';
import { isPointInRect } from 'components/Design/Canvas/utils/isPointInRect';

const isDropTargetContainer = (node: TSceneNode): node is TFrameNode | TSectionNode =>
  node.type === NodeType.frame || node.type === NodeType.section;

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
