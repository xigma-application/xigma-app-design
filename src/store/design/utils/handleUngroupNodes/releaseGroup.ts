// types
import { TDesignPage, TDesignState } from '../../types';
import { TGroupLikeNode, TSceneNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { getUngroupedOrder } from './getUngroupedOrder';
import { isContainerNode } from '../nodeHierarchy/isContainerNode';
import { syncAutoLayoutChildren } from '../autoLayout/syncAutoLayoutChildren/syncAutoLayoutChildren';
import { syncGroupBounds } from '../syncGroupBounds';

const reparentAndRemoveGroup = (page: TDesignPage, group: TGroupLikeNode): void => {
  group.childIds.forEach((id) => {
    const child = page.nodes[id];

    if (child) {
      child.parentId = group.parentId;
    }
  });

  delete page.nodes[group.id];
};

const applyUngroupedOrder = (page: TDesignPage, parent: TSceneNode | null, nextOrder: string[]): void => {
  if (parent && isContainerNode(parent)) {
    parent.childIds = nextOrder;
  } else {
    page.rootOrder = nextOrder;
  }
};

export const releaseGroup = (state: TDesignState, group: TGroupLikeNode): string[] => {
  const page = getActivePage(state);
  const parent = group.parentId ? page.nodes[group.parentId] : null;
  const containerOrder = parent && isContainerNode(parent) ? parent.childIds : page.rootOrder;
  const nextOrder = getUngroupedOrder(containerOrder, group.id, group.childIds);

  reparentAndRemoveGroup(page, group);
  applyUngroupedOrder(page, parent, nextOrder);
  syncGroupBounds(state, group.parentId);
  syncAutoLayoutChildren(state, group.parentId);

  return group.childIds;
};
