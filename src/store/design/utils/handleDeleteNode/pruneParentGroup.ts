// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { handleDeleteNode } from './handleDeleteNode';
import { isContainerNode } from '../nodeHierarchy/isContainerNode';
import { syncAutoLayoutChildren } from '../autoLayout/syncAutoLayoutChildren';
import { syncGroupBounds } from '../syncGroupBounds';

export const pruneParentGroup = (state: TDesignState, parentId: string | null, deletedChildId: string): void => {
  const parent = parentId ? getActivePage(state).nodes[parentId] : null;

  if (parent && isContainerNode(parent)) {
    parent.childIds = parent.childIds.filter((childId) => childId !== deletedChildId);

    if (parent.type === NodeType.group && parent.childIds.length === 0) {
      handleDeleteNode(state, parent.id);
    } else if (parent.type === NodeType.group) {
      syncGroupBounds(state, parent.id);
    } else if (parent.type === NodeType.frame) {
      syncAutoLayoutChildren(state, parent.id);
    }
  }
};
