// types
import { TDesignPage } from '../../types';

// utils
import { getGroupInsertionOrder } from './getGroupInsertionOrder';
import { isContainerNode } from '../nodeHierarchy/isContainerNode';

export const finalizeGroupPlacement = (page: TDesignPage, parentId: string | null, groupId: string, existingMemberIds: string[]): void => {
  const parent = parentId ? page.nodes[parentId] : null;
  const containerOrder = parent && isContainerNode(parent) ? parent.childIds : page.rootOrder;
  const nextOrder = getGroupInsertionOrder(containerOrder, new Set(existingMemberIds), groupId);

  if (parent && isContainerNode(parent)) {
    parent.childIds = nextOrder;
  } else {
    page.rootOrder = nextOrder;
  }

  page.selectedIds = [groupId];
};
