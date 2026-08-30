// types
import { TDesignState } from '../../types';

// utils
import { cascadeDeleteGroupChildren } from './cascadeDeleteGroupChildren';
import { cascadeDeletePathTextBinding } from './cascadeDeletePathTextBinding';
import { getActivePage } from '../getActivePage';
import { pruneParentGroup } from './pruneParentGroup';
import { removeNodeFromPage } from './removeNodeFromPage';

export const handleDeleteNode = (state: TDesignState, id: string): void => {
  const node = getActivePage(state).nodes[id];

  if (node) {
    const { parentId } = node;

    removeNodeFromPage(state, id);
    cascadeDeleteGroupChildren(state, node);
    cascadeDeletePathTextBinding(state, node);
    pruneParentGroup(state, parentId, id);
  }
};
