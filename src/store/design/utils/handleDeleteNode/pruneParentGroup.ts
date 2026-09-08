// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { isContainerNode } from '../nodeHierarchy/isContainerNode';
import { pruneGroupOrMaskParent } from './pruneGroupOrMaskParent';
import { syncAutoLayoutChildren } from '../autoLayout/syncAutoLayoutChildren/syncAutoLayoutChildren';

export const pruneParentGroup = (state: TDesignState, parentId: string | null, deletedChildId: string): void => {
  const parent = parentId ? getActivePage(state).nodes[parentId] : null;

  if (parent && isContainerNode(parent)) {
    parent.childIds = parent.childIds.filter((childId) => childId !== deletedChildId);

    switch (parent.type) {
      case NodeType.group:
      case NodeType.mask:
        pruneGroupOrMaskParent(state, parent);
        break;
      case NodeType.frame:
        syncAutoLayoutChildren(state, parent.id);
        break;
      default:
        break;
    }
  }
};
