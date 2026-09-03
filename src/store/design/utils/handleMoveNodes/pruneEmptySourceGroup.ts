// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { handleDeleteNode } from '../handleDeleteNode/handleDeleteNode';
import { isContainerNode } from '../nodeHierarchy/isContainerNode';
import { syncGroupBounds } from '../syncGroupBounds';

export const pruneEmptySourceGroup = (state: TDesignState, sourceParentId: string | null, targetParentId: string | null): void => {
  if (sourceParentId && sourceParentId !== targetParentId) {
    const sourceParent = getActivePage(state).nodes[sourceParentId];

    if (sourceParent && isContainerNode(sourceParent)) {
      if (sourceParent.type === NodeType.group && sourceParent.childIds.length === 0) {
        handleDeleteNode(state, sourceParentId);
      } else if (sourceParent.type === NodeType.group) {
        syncGroupBounds(state, sourceParentId);
      }
    }
  }
};
