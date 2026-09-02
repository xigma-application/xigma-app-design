import { RefObject } from 'react';

// others
import { ALIGNMENT_SNAP_TOLERANCE_PX, EQUAL_SPACING_SNAP_TOLERANCE_PX, GRID_CELL_SIZE_MATCH_TOLERANCE_PX } from 'constant/canvas';

// store
import { selectNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { dispatchDraggedNodeUpdates } from './dispatchDraggedNodeUpdates';
import { getChainGapDragSnap } from './getChainGapDragSnap';
import { getDragAlignmentSnap } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getDragAlignmentSnap';
import { getMatchedPairDragGuides } from './getMatchedPairDragGuides';
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { initDraggedNodeIds } from './initDraggedNodeIds';
import { screenToWorld } from '../../../../../utils/screenToWorld';
import { updateDragSnapshotDeltas } from './updateDragSnapshotDeltas';

export const continueDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const dragState = dragStateRef.current;

  if (dragState) {
    const state = store.getState();
    const viewport = selectViewport(state);
    const point = screenToWorld(getPointerPosition(canvas, event), viewport);
    const rawDeltaX = point.x - dragState.pointerStart.x;
    const rawDeltaY = point.y - dragState.pointerStart.y;
    const snapshots = canvasRefs.vectorSnapshots.draggedVectorNodeSnapshotsRef.current;
    const nodes = selectNodes(state);
    const { delta: alignmentDelta, guide } = getDragAlignmentSnap(
      nodes,
      dragState.nodeOrigins,
      { x: rawDeltaX, y: rawDeltaY },
      ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom,
      dragState.candidateShapes,
    );
    const chainGapSnap = getChainGapDragSnap(nodes, dragState, alignmentDelta, EQUAL_SPACING_SNAP_TOLERANCE_PX / viewport.zoom);
    const deltaX = alignmentDelta.x + chainGapSnap.delta.x;
    const deltaY = alignmentDelta.y + chainGapSnap.delta.y;
    const matchedPairGuides = getMatchedPairDragGuides(
      nodes,
      dragState,
      { x: deltaX, y: deltaY },
      GRID_CELL_SIZE_MATCH_TOLERANCE_PX / viewport.zoom,
      ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom,
    );

    dragState.hasMoved = true;
    canvasRefs.transform.alignmentGuideRef.current = matchedPairGuides ? null : guide;
    canvasRefs.transform.equalSpacingGuidesRef.current = chainGapSnap.guides;
    canvasRefs.transform.matchedPairGuidesRef.current = matchedPairGuides;

    initDraggedNodeIds(canvasRefs, dragState);
    updateDragSnapshotDeltas(snapshots, deltaX, deltaY);
    dispatchDraggedNodeUpdates(dispatch, dragState, snapshots, deltaX, deltaY);
  }
};
