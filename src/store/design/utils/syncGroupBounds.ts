// types
import { TDesignState } from '../types';

// utils
import { getActivePage } from './getActivePage';
import { getGroupBoundsChildIds } from './nodeHierarchy/getGroupBoundsChildIds';
import { getNodesBoundingBox } from './getNodesBoundingBox';
import { getRotatedGroupBounds } from './getRotatedGroupBounds';
import { isGroupLikeNode } from './nodeHierarchy/isGroupLikeNode';

export const syncGroupBounds = (state: TDesignState, groupId: string | null): void => {
  if (groupId) {
    const { nodes } = getActivePage(state);
    const group = nodes[groupId];

    if (group && isGroupLikeNode(group)) {
      const children = getGroupBoundsChildIds(group)
        .map((childId) => nodes[childId])
        .filter(Boolean);

      if (children.length > 0) {
        const bounds = group.rotation === 0 ? getNodesBoundingBox(children) : getRotatedGroupBounds(children, group.rotation);

        group.height = bounds.height;
        group.width = bounds.width;
        group.x = bounds.x;
        group.y = bounds.y;
      }

      syncGroupBounds(state, group.parentId);
    }
  }
};
