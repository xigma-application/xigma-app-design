// store
import { updateNode } from 'store/design/slice';
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { getGridPlacementInputs } from 'store/design/utils/autoLayout/getGridPlacementInputs';
import { getGridAxisTrackCount } from 'store/design/utils/autoLayout/gridTracks/getGridAxisTrackCount';
import { getVectorSelectionSnapshot } from 'store/history/getVectorSelectionSnapshot';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridMoveStep } from './getGridMoveStep';
import { getGridSlotMoveCandidates } from './getGridSlotMoveCandidates';
import { placeGridCells } from 'store/design/utils/autoLayout/computeGridLayoutPositions/placeGridCells/placeGridCells';
import { TGridSlotMoveCandidate } from './getGridSlotMoveCandidate';

export const handleGridSlotMove = (
  dispatch: AppDispatch,
  refs: TCanvasRefs,
  frame: TFrameNode,
  selectedNodes: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
  deltaX: number,
  deltaY: number,
): void => {
  const step = getGridMoveStep(deltaX, deltaY);

  if (step) {
    const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
    const rowCount = getGridAxisTrackCount(frame, nodesById, 'row');
    const placements = placeGridCells(getGridPlacementInputs(frame.childIds, nodesById), columnCount, false);
    const candidates = getGridSlotMoveCandidates(placements, selectedNodes, step, columnCount, rowCount);

    if (candidates.every((candidate): candidate is TGridSlotMoveCandidate => candidate !== null)) {
      dispatch(beginHistoryGesture(getVectorSelectionSnapshot(refs)));
      candidates.forEach((candidate) =>
        dispatch(
          updateNode({
            changes: { gridColumnAnchorIndex: candidate.columnStart, gridRowAnchorIndex: candidate.rowStart },
            id: candidate.id,
          }),
        ),
      );
      dispatch(endHistoryGesture());
    }
  }
};
