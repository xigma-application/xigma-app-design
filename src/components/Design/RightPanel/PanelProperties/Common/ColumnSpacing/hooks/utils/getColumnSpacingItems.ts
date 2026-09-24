// types
import { TSceneNode } from 'types/design/types';

// utils
import { isNudgeableNode } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/isNudgeableNode';
import { isSpacingContainerNode } from './isSpacingContainerNode';

export const getColumnSpacingItems = (selectedNodes: TSceneNode[], nodes: Record<string, TSceneNode>): TSceneNode[] => {
  const [firstNode] = selectedNodes;

  if (selectedNodes.length === 1 && isSpacingContainerNode(firstNode)) {
    return firstNode.childIds.map((id) => nodes[id]).filter((node): node is TSceneNode => Boolean(node));
  }

  return selectedNodes.filter((node) => isNudgeableNode(node, nodes));
};
