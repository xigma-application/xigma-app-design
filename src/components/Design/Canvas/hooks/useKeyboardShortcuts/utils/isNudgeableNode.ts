// types
import { TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { isNodeManagedLayoutChild } from 'utils/canvas/signals/isNodeManagedLayoutChild';

export const isNudgeableNode = (node: TSceneNode, nodesById: Record<string, TSceneNode>): boolean => {
  if (isNodeManagedLayoutChild(node, nodesById)) {
    return isBoxSceneNode(node) && Boolean(node.ignoreAutoLayout);
  }

  return true;
};
