// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { isBooleanOperandNode } from '../nodeHierarchy/isBooleanOperandNode';

export const getIsInvalidBooleanDrop = (
  targetParentId: string | null,
  nodeIds: string[],
  nodesById: Record<string, TSceneNode>,
): boolean => {
  const targetParent = targetParentId ? nodesById[targetParentId] : null;
  return targetParent?.type === NodeType.boolean && nodeIds.some((id) => !nodesById[id] || !isBooleanOperandNode(nodesById[id], nodesById));
};
