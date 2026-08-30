// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { handleDeleteNode } from '../handleDeleteNode/handleDeleteNode';
import { removeNodesFromContainer } from '../removeNodesFromContainer';
import { syncGroupBounds } from '../syncGroupBounds';

export const stealMembersFromOldParents = (state: TDesignState, stolenMemberIds: string[], targetParentId: string | null): void => {
  const page = getActivePage(state);
  const oldParentIds = new Set(stolenMemberIds.map((id) => page.nodes[id]?.parentId ?? null));

  oldParentIds.forEach((oldParentId) => {
    const idsFromThisParent = stolenMemberIds.filter((id) => (page.nodes[id]?.parentId ?? null) === oldParentId);

    removeNodesFromContainer(page, oldParentId, idsFromThisParent);

    if (oldParentId && oldParentId !== targetParentId) {
      const oldParent = page.nodes[oldParentId];

      if (oldParent && oldParent.type === NodeType.group && oldParent.childIds.length === 0) {
        handleDeleteNode(state, oldParentId);
      } else {
        syncGroupBounds(state, oldParentId);
      }
    }
  });
};
