// types
import { TDesignState } from '../../types';

// utils
import { buildGroupNode } from './buildGroupNode';
import { finalizeGroupPlacement } from './finalizeGroupPlacement';
import { getActivePage } from '../getActivePage';
import { getGroupableMembers } from './getGroupableMembers';
import { getIsDescendantOfMovedNodes } from '../handleMoveNodes/getIsDescendantOfMovedNodes';
import { insertGroupNode } from './insertGroupNode';
import { isGroupLikeNode } from '../nodeHierarchy/isGroupLikeNode';
import { stealMembersFromOldParents } from './stealMembersFromOldParents';
import { syncGroupBounds } from '../syncGroupBounds';

export const handleGroupNodes = (state: TDesignState, groupId: string): void => {
  const page = getActivePage(state);
  const selectedNodes = page.selectedIds.map((id) => page.nodes[id]).filter(Boolean);
  const groupable = getGroupableMembers(selectedNodes);

  if (groupable) {
    const { memberNodes, parentId } = groupable;
    const memberIds = memberNodes.map((node) => node.id);
    const isCycle = getIsDescendantOfMovedNodes(parentId, memberIds, page.nodes);

    if (!isCycle) {
      const memberIdSet = new Set(memberIds);
      const initialParent = parentId ? page.nodes[parentId] : null;
      const initialContainerOrder = initialParent && isGroupLikeNode(initialParent) ? initialParent.childIds : page.rootOrder;
      const existingMemberIds = initialContainerOrder.filter((id) => memberIdSet.has(id));
      const stolenMemberIds = memberIds.filter((id) => !initialContainerOrder.includes(id));
      const orderedMemberIds = [...existingMemberIds, ...stolenMemberIds];
      const group = buildGroupNode(groupId, parentId, orderedMemberIds, page.nodes);

      stealMembersFromOldParents(state, stolenMemberIds, parentId);
      insertGroupNode(page.nodes, groupId, group, orderedMemberIds);
      finalizeGroupPlacement(page, parentId, groupId, existingMemberIds);
      syncGroupBounds(state, parentId);
    }
  }
};
