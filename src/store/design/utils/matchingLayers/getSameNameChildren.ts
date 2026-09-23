// types
import { TSceneNode } from 'types/design/types';

// utils
import { isContainerNode } from '../nodeHierarchy/isContainerNode';

export const getSameNameChildren = (parent: TSceneNode, name: string, nodesById: Record<string, TSceneNode>): TSceneNode[] => {
  if (isContainerNode(parent)) {
    return parent.childIds.map((childId) => nodesById[childId]).filter((child) => child?.name === name);
  }

  return [];
};
