// types
import { TDesignState } from '../types';
import { NodeType } from 'types/design/enums';

// utils
import { getActivePage } from './getActivePage';
import { getNodesBoundingBox } from './getNodesBoundingBox';
import { getRotatedGroupBounds } from './getRotatedGroupBounds';

export const syncGroupBounds = (state: TDesignState, groupId: string | null): void => {
  if (!groupId) {
    return;
  }

  const { nodes } = getActivePage(state);
  const group = nodes[groupId];

  if (!group || group.type !== NodeType.group) {
    return;
  }

  const children = group.childIds.map((childId) => nodes[childId]).filter(Boolean);

  if (children.length > 0) {
    const bounds = group.rotation === 0 ? getNodesBoundingBox(children) : getRotatedGroupBounds(children, group.rotation);

    group.height = bounds.height;
    group.width = bounds.width;
    group.x = bounds.x;
    group.y = bounds.y;
  }

  syncGroupBounds(state, group.parentId);
};
