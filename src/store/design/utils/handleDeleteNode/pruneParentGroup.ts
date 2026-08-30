// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { handleDeleteNode } from './handleDeleteNode';
import { syncGroupBounds } from '../syncGroupBounds';

export const pruneParentGroup = (state: TDesignState, parentId: string | null, deletedChildId: string): void => {
  const parent = parentId ? getActivePage(state).nodes[parentId] : null;

  if (parent && parent.type === NodeType.group) {
    parent.childIds = parent.childIds.filter((childId) => childId !== deletedChildId);

    if (parent.childIds.length === 0) {
      handleDeleteNode(state, parent.id);
    } else {
      syncGroupBounds(state, parent.id);
    }
  }
};
