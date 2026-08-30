// types
import { TDesignState, TMoveNodesPayload } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { getIsDescendantOfMovedNodes } from './getIsDescendantOfMovedNodes';
import { insertNodesIntoContainer } from './insertNodesIntoContainer';
import { pruneEmptySourceGroup } from './pruneEmptySourceGroup';
import { removeNodesFromContainer } from '../removeNodesFromContainer';
import { syncGroupBounds } from '../syncGroupBounds';

export const handleMoveNodes = (state: TDesignState, { nodeIds, targetIndex, targetParentId }: TMoveNodesPayload): void => {
  const page = getActivePage(state);
  const isCycle = getIsDescendantOfMovedNodes(targetParentId, nodeIds, page.nodes);

  if (!isCycle) {
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
  }
};
