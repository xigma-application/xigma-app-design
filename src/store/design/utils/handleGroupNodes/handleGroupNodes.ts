// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { buildGroupNode } from './buildGroupNode';
import { getActivePage } from '../getActivePage';
import { getGroupableMembers } from './getGroupableMembers';
import { getGroupInsertionOrder } from './getGroupInsertionOrder';
import { getIsDescendantOfMovedNodes } from '../handleMoveNodes/getIsDescendantOfMovedNodes';
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
      const initialContainerOrder = initialParent && initialParent.type === NodeType.group ? initialParent.childIds : page.rootOrder;
      const existingMemberIds = initialContainerOrder.filter((id) => memberIdSet.has(id));
      const stolenMemberIds = memberIds.filter((id) => !initialContainerOrder.includes(id));
      const orderedMemberIds = [...existingMemberIds, ...stolenMemberIds];
      const group = buildGroupNode(groupId, parentId, orderedMemberIds, page.nodes);

      // Stealing can prune a now-empty sibling group out of the target container itself (e.g. a
      // stolen member's old group happened to also sit in that same container), so the target's own
      // order must be re-read afterwards rather than reused from before stealing ran.
      stealMembersFromOldParents(state, stolenMemberIds, parentId);

      page.nodes[groupId] = group;
      orderedMemberIds.forEach((id) => {
        page.nodes[id].parentId = groupId;
      });

      const parent = parentId ? page.nodes[parentId] : null;
      const containerOrder = parent && parent.type === NodeType.group ? parent.childIds : page.rootOrder;
      const nextOrder = getGroupInsertionOrder(containerOrder, new Set(existingMemberIds), groupId);

      if (parent && parent.type === NodeType.group) {
        parent.childIds = nextOrder;
      } else {
        page.rootOrder = nextOrder;
      }

      page.selectedIds = [groupId];
      syncGroupBounds(state, parentId);
    }
  }
};
