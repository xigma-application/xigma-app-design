// types
import { TSceneNode } from 'types/design/types';

export type TGroupableMembers = {
  memberNodes: TSceneNode[];
  parentId: string | null;
};

export const getGroupableMembers = (selectedNodes: TSceneNode[]): TGroupableMembers | null => {
  if (selectedNodes.length === 0) {
    return null;
  }

  return { memberNodes: selectedNodes, parentId: selectedNodes[0].parentId };
};
