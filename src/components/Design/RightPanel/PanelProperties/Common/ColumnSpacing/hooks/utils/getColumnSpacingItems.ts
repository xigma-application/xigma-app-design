// types
import { TSceneNode } from 'types/design/types';

// utils
import { isFreeFormFrameWithChildren } from '../../../PositionSection/ColumnAlignment/hooks/utils/isFreeFormFrameWithChildren';
import { isNudgeableNode } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/isNudgeableNode';

export const getColumnSpacingItems = (selectedNodes: TSceneNode[], nodes: Record<string, TSceneNode>): TSceneNode[] => {
  const [firstNode] = selectedNodes;

  if (selectedNodes.length === 1 && isFreeFormFrameWithChildren(firstNode)) {
    return firstNode.childIds.map((id) => nodes[id]).filter((node): node is TSceneNode => Boolean(node));
  }

  return selectedNodes.filter((node) => isNudgeableNode(node, nodes));
};
