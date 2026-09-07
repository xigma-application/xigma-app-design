// types
import { TDesignState, TMoveNodesPayload } from '../../types';

// utils
import { getActivePage } from '../getActivePage';
import { getIsDescendantOfMovedNodes } from './getIsDescendantOfMovedNodes';
import { getIsNestingSection } from './getIsNestingSection';
import { insertNodesIntoContainer } from './insertNodesIntoContainer';
import { pruneEmptySourceGroup } from './pruneEmptySourceGroup';
import { removeNodesFromContainer } from '../removeNodesFromContainer';
import { reparentNodes } from './reparentNodes';
import { syncAutoLayoutChildren } from '../autoLayout/syncAutoLayoutChildren/syncAutoLayoutChildren';
import { syncGroupBounds } from '../syncGroupBounds';

export const handleMoveNodes = (state: TDesignState, { nodeIds, targetIndex, targetParentId }: TMoveNodesPayload): void => {
  const page = getActivePage(state);
  const isNestingSection = getIsNestingSection(targetParentId, nodeIds, page.nodes);
  const isCycle = getIsDescendantOfMovedNodes(targetParentId, nodeIds, page.nodes);

  if (!isCycle && !isNestingSection) {
    const sourceParentId = page.nodes[nodeIds[0]]?.parentId ?? null;
    const isReparenting = sourceParentId !== targetParentId;

    removeNodesFromContainer(page, sourceParentId, nodeIds);
    reparentNodes(page, nodeIds, targetParentId, isReparenting);
    insertNodesIntoContainer(page, targetParentId, nodeIds, targetIndex);
    pruneEmptySourceGroup(state, sourceParentId, targetParentId);
    syncGroupBounds(state, targetParentId);
    syncAutoLayoutChildren(state, sourceParentId);
    syncAutoLayoutChildren(state, targetParentId);
  }
};
