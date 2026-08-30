// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const getGroupSubtreeNodes = (node: TSceneNode, nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  if (node.type !== NodeType.group) {
    return [node];
  }

  return [node, ...node.childIds.flatMap((childId) => (nodesById[childId] ? getGroupSubtreeNodes(nodesById[childId], nodesById) : []))];
};
