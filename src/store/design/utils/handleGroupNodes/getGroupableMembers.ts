// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export type TGroupableMembers = {
  memberNodes: TSceneNode[];
  parentId: string | null;
};

export const getGroupableMembers = (selectedNodes: TSceneNode[]): TGroupableMembers | null => {
  if (selectedNodes.length === 0) {
    return null;
  }

  if (selectedNodes.some((node) => node.type === NodeType.section)) {
    return null;
  }

  return { memberNodes: selectedNodes, parentId: selectedNodes[0].parentId };
};
