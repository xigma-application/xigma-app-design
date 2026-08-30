// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const getGroupLeafNodes = (group: TSceneNode, nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  if (group.type !== NodeType.group) {
    return [group];
  }

  return group.childIds.flatMap((childId) => {
    const child = nodesById[childId];
    return child ? getGroupLeafNodes(child, nodesById) : [];
  });
};
