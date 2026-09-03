// store
import { getIsDescendantOfMovedNodes } from 'store/design/utils/handleMoveNodes/getIsDescendantOfMovedNodes';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getFrameAtWorldPoint } from 'components/Design/Canvas/utils/getFrameAtWorldPoint';

export const getDragDropTargetFrame = (
  selectedNodes: TSceneNode[],
  point: TPoint,
  renderOrderedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): string | null => {
  const isEligible = !selectedNodes.some((node) => node.type === NodeType.section);

  if (isEligible) {
    const frame = getFrameAtWorldPoint(point, renderOrderedNodes);
    const selectedIds = selectedNodes.map((node) => node.id);

    return frame && !getIsDescendantOfMovedNodes(frame.id, selectedIds, nodesById) ? frame.id : null;
  }

  return null;
};
