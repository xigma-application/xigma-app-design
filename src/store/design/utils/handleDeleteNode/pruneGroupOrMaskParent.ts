// types
import { TDesignState } from '../../types';
import { TGroupLikeNode } from 'types/design/types';

// utils
import { handleDeleteNode } from './handleDeleteNode';
import { syncGroupBounds } from '../syncGroupBounds';

export const pruneGroupOrMaskParent = (state: TDesignState, parent: TGroupLikeNode): void => {
  if (parent.childIds.length === 0) {
    handleDeleteNode(state, parent.id);
  } else {
    syncGroupBounds(state, parent.id);
  }
};
