// types
import { TSceneNode } from 'types/design/types';

// utils
import { getTopLevelAncestor } from 'store/design/utils/nodeHierarchy/getTopLevelAncestor';

export const isSelectionInsideGroup = (groupId: string, selectedNodes: TSceneNode[], nodesById: Record<string, TSceneNode>): boolean =>
  selectedNodes.length > 0 && selectedNodes.every((node) => node.parentId && getTopLevelAncestor(node, nodesById).id === groupId);
