// types
import { TSceneNode } from 'types/design/types';

// utils
import { getGroupLeafNodes } from './getGroupLeafNodes';
import { isGroupLikeNode } from './isGroupLikeNode';

export const getSmartSelectionNodes = (selectedNodes: TSceneNode[], nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  if (selectedNodes.length === 1 && isGroupLikeNode(selectedNodes[0])) {
    return getGroupLeafNodes(selectedNodes[0], nodesById);
  }

  return selectedNodes;
};
