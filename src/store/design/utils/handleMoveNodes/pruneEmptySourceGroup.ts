// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { handleDeleteNode } from '../handleDeleteNode/handleDeleteNode';
import { syncGroupBounds } from '../syncGroupBounds';

export const pruneEmptySourceGroup = (state: TDesignState, sourceParentId: string | null, targetParentId: string | null): void => {
  if (sourceParentId && sourceParentId !== targetParentId) {
    const sourceParent = getActivePage(state).nodes[sourceParentId];

    if (sourceParent && sourceParent.type === NodeType.group && sourceParent.childIds.length === 0) {
      handleDeleteNode(state, sourceParentId);
    } else {
      syncGroupBounds(state, sourceParentId);
    }
  }
};
