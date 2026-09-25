// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

// utils
import { canHoldSection } from '../nodeHierarchy/canHoldSection';

export const canWrapInSection = (selectedNodes: (TSceneNode | undefined)[], nodes: Record<string, TSceneNode>): boolean => {
  const [firstNode] = selectedNodes;

  if (
    firstNode &&
    selectedNodes.every((node) => node !== undefined && node.parentId === firstNode.parentId && node.type !== NodeType.slice)
  ) {
    return canHoldSection(firstNode.parentId, nodes);
  }

  return false;
};
