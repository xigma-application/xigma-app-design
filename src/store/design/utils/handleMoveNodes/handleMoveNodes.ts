// types
import { NodeType } from 'types/design/enums';
import { TDesignState, TMoveNodesPayload } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { getIsDescendantOfMovedNodes } from './getIsDescendantOfMovedNodes';
import { insertNodesIntoContainer } from './insertNodesIntoContainer';
import { isContainerNode } from '../nodeHierarchy/isContainerNode';
import { pruneEmptySourceGroup } from './pruneEmptySourceGroup';
import { removeNodesFromContainer } from '../removeNodesFromContainer';
import { syncAutoLayoutChildren } from '../autoLayout/syncAutoLayoutChildren';
import { syncGroupBounds } from '../syncGroupBounds';

export const handleMoveNodes = (state: TDesignState, { nodeIds, targetIndex, targetParentId }: TMoveNodesPayload): void => {
  const page = getActivePage(state);
  const targetParent = targetParentId ? page.nodes[targetParentId] : null;
  const isNestingSection =
    targetParent !== null && isContainerNode(targetParent) && nodeIds.some((id) => page.nodes[id]?.type === NodeType.section);
  const isCycle = getIsDescendantOfMovedNodes(targetParentId, nodeIds, page.nodes);

  if (!isCycle && !isNestingSection) {
    const sourceParentId = page.nodes[nodeIds[0]]?.parentId ?? null;

    removeNodesFromContainer(page, sourceParentId, nodeIds);
    nodeIds.forEach((nodeId) => {
      const node = page.nodes[nodeId];

      if (node) {
        node.parentId = targetParentId;
      }
    });

    insertNodesIntoContainer(page, targetParentId, nodeIds, targetIndex);
    pruneEmptySourceGroup(state, sourceParentId, targetParentId);
    syncGroupBounds(state, targetParentId);
    syncAutoLayoutChildren(state, sourceParentId);
    syncAutoLayoutChildren(state, targetParentId);
  }
};
