// types
import { TGroupNode, TSceneNode } from 'types/design/types';

export const insertGroupNode = (
  nodes: Record<string, TSceneNode>,
  groupId: string,
  group: TGroupNode,
  orderedMemberIds: string[],
): void => {
  nodes[groupId] = group;
  orderedMemberIds.forEach((id) => {
    nodes[id].parentId = groupId;
  });
};
