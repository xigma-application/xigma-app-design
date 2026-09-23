// store
import { moveNodes } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { selectNodes } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFlowAxisMove } from '../getFlowAxisMove';
import { TFrameNode } from 'types/design/types';

// utils
import { getFlowBackwardCrossCandidateIds, TFlowBackwardCrossCandidate } from '../getFlowBackwardCrossCandidateIds';
import { getFlowLineGroupsForOrder } from '../getFlowLineGroupsForOrder';
import { getFlowReorderSelectionLine } from '../getFlowReorderSelectionLine';
import { getFlowReorderTargetIndex } from '../getFlowReorderTargetIndex';
import { getFlowWrapSizingConfig } from '../getFlowWrapSizingConfig';
import { isFlowReorderCandidateValid } from '../isFlowReorderCandidateValid';

const getLiveChildIds = (frame: TFrameNode): string[] => (selectNodes(store.getState())[frame.id] as TFrameNode).childIds;

const moveBackwardCrossBlock = (
  dispatch: AppDispatch,
  frame: TFrameNode,
  orderedSelectedIds: string[],
  backwardCandidate: TFlowBackwardCrossCandidate,
  evictedAnchorId: string | undefined,
): void => {
  const blockTargetIndex = getFlowReorderTargetIndex(frame.childIds, orderedSelectedIds, backwardCandidate.blockAnchorId, 'before');

  dispatch(moveNodes({ nodeIds: orderedSelectedIds, targetIndex: blockTargetIndex, targetParentId: frame.id }));

  if (backwardCandidate.evictedIds.length > 0) {
    const evictedTargetIndex = getFlowReorderTargetIndex(getLiveChildIds(frame), backwardCandidate.evictedIds, evictedAnchorId, 'before');

    dispatch(moveNodes({ nodeIds: backwardCandidate.evictedIds, targetIndex: evictedTargetIndex, targetParentId: frame.id }));
  }
};

export const handleBackwardCrossReorder = (
  dispatch: AppDispatch,
  refs: TCanvasRefs,
  frame: TFrameNode,
  sizesById: Map<string, TAutoLayoutChildSize>,
  flowIds: string[],
  orderedSelectedIds: string[],
  selectedIdSet: Set<string>,
  lineGroups: string[][],
  axisMove: TFlowAxisMove,
): void => {
  const selectionLine = getFlowReorderSelectionLine(lineGroups, orderedSelectedIds);

  if (selectionLine && selectionLine.lineIndex > 0) {
    const previousLine = lineGroups[selectionLine.lineIndex - 1];
    const blockIndexInOwnLine = selectionLine.firstIndex - selectionLine.lineStart;
    const { availablePrimary, isHorizontal, itemSpacing } = getFlowWrapSizingConfig(frame);
    const backwardCandidate = getFlowBackwardCrossCandidateIds(
      flowIds,
      previousLine,
      orderedSelectedIds,
      blockIndexInOwnLine,
      sizesById,
      isHorizontal,
      itemSpacing,
      availablePrimary,
    );
    const isValid =
      backwardCandidate !== null &&
      isFlowReorderCandidateValid(
        getFlowLineGroupsForOrder(frame, sizesById, backwardCandidate.candidateFlowIds),
        orderedSelectedIds,
        axisMove,
      );

    if (backwardCandidate && isValid) {
      const restIds = flowIds.filter((id) => !previousLine.includes(id) && !selectedIdSet.has(id));

      dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
      moveBackwardCrossBlock(dispatch, frame, orderedSelectedIds, backwardCandidate, restIds[0]);
      dispatch(endHistoryGesture());
    }
  }
};
