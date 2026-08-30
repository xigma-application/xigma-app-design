// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TGroupNode } from 'types/design/types';

// utils
import { getActivePage } from '../getActivePage';
import { getUngroupedOrder } from './getUngroupedOrder';
import { syncGroupBounds } from '../syncGroupBounds';

export const releaseGroup = (state: TDesignState, group: TGroupNode): string[] => {
  const page = getActivePage(state);
  const parent = group.parentId ? page.nodes[group.parentId] : null;
  const containerOrder = parent && parent.type === NodeType.group ? parent.childIds : page.rootOrder;
  const nextOrder = getUngroupedOrder(containerOrder, group.id, group.childIds);

  group.childIds.forEach((id) => {
    const child = page.nodes[id];

    if (child) {
      child.parentId = group.parentId;
    }
  });

  delete page.nodes[group.id];

  if (parent && parent.type === NodeType.group) {
    parent.childIds = nextOrder;
  } else {
    page.rootOrder = nextOrder;
  }

  syncGroupBounds(state, group.parentId);

  return group.childIds;
};
