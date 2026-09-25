// types
import { TSceneNode, TSectionNode } from 'types/design/types';

// utils
import { isContainerNode } from 'store/design/utils/nodeHierarchy/isContainerNode';

export const getSectionSiblingIds = (section: TSectionNode, nodesById: Record<string, TSceneNode>, rootOrder: string[]): string[] => {
  const parent = section.parentId ? nodesById[section.parentId] : null;
  return parent && isContainerNode(parent) ? parent.childIds : rootOrder;
};
