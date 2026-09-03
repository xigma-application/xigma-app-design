// store
import { getIsDescendantOfMovedNodes } from 'store/design/utils/handleMoveNodes/getIsDescendantOfMovedNodes';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getFrameAtWorldPoint } from 'components/Design/Canvas/utils/getFrameAtWorldPoint';
import { getSelectionBounds } from 'components/Design/Canvas/utils/getSelectionBounds';

export const getDragDropTargetFrame = (
  selectedNodes: TSceneNode[],
  deltaX: number,
  deltaY: number,
  renderOrderedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): string | null => {
  const isEligible = !selectedNodes.some((node) => node.type === NodeType.section);

  if (isEligible) {
    const bounds = getSelectionBounds(selectedNodes);
    const center = { x: bounds.x + bounds.width / 2 + deltaX, y: bounds.y + bounds.height / 2 + deltaY };
    const frame = getFrameAtWorldPoint(center, renderOrderedNodes);
    const selectedIds = selectedNodes.map((node) => node.id);

    return frame && !getIsDescendantOfMovedNodes(frame.id, selectedIds, nodesById) ? frame.id : null;
  }

  return null;
};
