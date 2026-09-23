// store
import { getAutoLayoutSyncChildren } from 'store/design/utils/autoLayout/syncAutoLayoutChildren/getAutoLayoutSyncChildren';
import { AppDispatch } from 'store';

// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getFlowAxisMove } from '../getFlowAxisMove';
import { getFlowLineGroupsForOrder } from '../getFlowLineGroupsForOrder';
import { handleBackwardCrossReorder } from './handleBackwardCrossReorder';
import { handleForwardOrPrimaryReorder } from './handleForwardOrPrimaryReorder';

export const handleFlowReorderMove = (
  dispatch: AppDispatch,
  refs: TCanvasRefs,
  frame: TFrameNode,
  selectedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
  deltaX: number,
  deltaY: number,
): void => {
  const layoutMode = frame.layoutMode as LayoutMode.horizontal | LayoutMode.vertical;
  const axisMove = getFlowAxisMove(layoutMode, deltaX, deltaY);

  if (axisMove) {
    const { sizes } = getAutoLayoutSyncChildren(frame, nodesById);
    const sizesById = new Map<string, TAutoLayoutChildSize>(sizes.map((size) => [size.id, size]));
    const flowIds = sizes.map((size) => size.id);
    const lineGroups = getFlowLineGroupsForOrder(frame, sizesById, flowIds);
    const selectedIdSet = new Set(selectedNodes.map((node) => node.id));
    const orderedSelectedIds = flowIds.filter((id) => selectedIdSet.has(id));
    const hasEveryNodeInFlow = orderedSelectedIds.length === selectedNodes.length;

    if (hasEveryNodeInFlow) {
      const isBackwardCross = axisMove.kind === 'cross' && axisMove.direction === -1;

      if (isBackwardCross) {
        handleBackwardCrossReorder(dispatch, refs, frame, sizesById, flowIds, orderedSelectedIds, selectedIdSet, lineGroups, axisMove);
      } else {
        const siblingLineGroups = getFlowLineGroupsForOrder(
          frame,
          sizesById,
          flowIds.filter((id) => !selectedIdSet.has(id)),
        );

        handleForwardOrPrimaryReorder(dispatch, refs, frame, sizesById, orderedSelectedIds, lineGroups, siblingLineGroups, axisMove);
      }
    }
  }
};
