// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export type TGroupableMembers = {
  memberNodes: TSceneNode[];
  parentId: string | null;
};

export const getGroupableMembers = (selectedNodes: TSceneNode[]): TGroupableMembers | null => {
  switch (true) {
    case selectedNodes.length === 0:
    case selectedNodes.some((node) => node.type === NodeType.section || node.type === NodeType.slice):
      return null;
    default:
      return { memberNodes: selectedNodes, parentId: selectedNodes[0].parentId };
  }
};
