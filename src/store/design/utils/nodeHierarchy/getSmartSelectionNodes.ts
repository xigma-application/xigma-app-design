// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { getGroupLeafNodes } from './getGroupLeafNodes';

export const getSmartSelectionNodes = (selectedNodes: TSceneNode[], nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  if (selectedNodes.length === 1 && selectedNodes[0].type === NodeType.group) {
    return getGroupLeafNodes(selectedNodes[0], nodesById);
  }

  return selectedNodes;
};
