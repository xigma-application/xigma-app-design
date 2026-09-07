// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isContainerNode } from '../nodeHierarchy/isContainerNode';

export const getIsNestingSection = (targetParentId: string | null, nodeIds: string[], nodesById: Record<string, TSceneNode>): boolean => {
  const targetParent = targetParentId ? nodesById[targetParentId] : null;
  return targetParent !== null && isContainerNode(targetParent) && nodeIds.some((id) => nodesById[id]?.type === NodeType.section);
};
