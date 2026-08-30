// types
import { TDesignState, TMoveNodesToPagePayload } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { pruneParentGroup } from '../handleDeleteNode/pruneParentGroup';
import { relocateNodeSubtree } from './relocateNodeSubtree';

export const handleMoveNodesToPage = (state: TDesignState, { nodeIds, targetPageId }: TMoveNodesToPagePayload): void => {
  const sourcePage = getActivePage(state);
  const targetPage = state.pages[targetPageId];

  if (!targetPage || targetPage.id === sourcePage.id) {
    return;
  }

  nodeIds.forEach((nodeId) => {
    const draftNode = sourcePage.nodes[nodeId];

    if (draftNode) {
      const { parentId } = draftNode;

      relocateNodeSubtree(sourcePage, targetPage, nodeId);
      pruneParentGroup(state, parentId, nodeId);
    }

    return;
  });

  sourcePage.selectedIds = sourcePage.selectedIds.filter((id) => !nodeIds.includes(id));
};
