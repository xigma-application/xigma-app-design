import { RefObject } from 'react';

// others
import { ALIGNMENT_SNAP_TOLERANCE_PX, EQUAL_SPACING_SNAP_TOLERANCE_PX, GRID_CELL_SIZE_MATCH_TOLERANCE_PX } from 'constant/canvas';

// store
import { selectNodes, selectRenderOrderedNodes, selectSelectedNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TPoint } from 'types/canvas';

// utils
import { convertCtrlDragToMarquee } from './convertCtrlDragToMarquee';
import { dispatchDraggedNodeUpdates } from './dispatchDraggedNodeUpdates';
import { getAxisLockedPoint } from 'components/Design/Canvas/utils/getAxisLockedPoint';
import { getChainGapDragSnap } from './getChainGapDragSnap';
import { getDominantAxis } from 'components/Design/Canvas/utils/getDominantAxis';
import { getDragAlignmentSnap } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getDragAlignmentSnap';
import { getMatchedPairDragGuides } from './getMatchedPairDragGuides';
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { initDraggedNodeIds } from './initDraggedNodeIds';
import { screenToWorld } from '../../../../../utils/screenToWorld';
import { updateDragDropTarget } from './updateDragDropTarget';
import { updateDragSnapshotDeltas } from './updateDragSnapshotDeltas';

const AXIS_LOCK_CLASS_NAME = { x: 'move-x', y: 'move-y' } as const;

export const continueDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  dragStateRef: RefObject<TDragState | null>,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
  marqueeStartRef: RefObject<TPoint | null>,
): void => {
  const dragState = dragStateRef.current;

  if (dragState && dragState.ctrlMarqueeFallback && !dragState.hasMoved) {
    convertCtrlDragToMarquee(dragState, dragStateRef, marqueeStartRef, canvasRefs);
  } else if (dragState) {
    const state = store.getState();
    const viewport = selectViewport(state);
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
    const axisLock = event.shiftKey ? getDominantAxis(dragState.pointerStart, rawPoint, viewport.zoom) : null;
    const point = axisLock ? getAxisLockedPoint(dragState.pointerStart, rawPoint, axisLock) : rawPoint;
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
    const deltaX = axisLock === 'y' ? 0 : alignmentDelta.x + chainGapSnap.delta.x;
    const deltaY = axisLock === 'x' ? 0 : alignmentDelta.y + chainGapSnap.delta.y;
    const matchedPairGuides = getMatchedPairDragGuides(
      nodes,
      dragState,
      { x: deltaX, y: deltaY },
      GRID_CELL_SIZE_MATCH_TOLERANCE_PX / viewport.zoom,
      ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom,
    );
    const selectedNodes = selectSelectedNodes(state);
    const renderOrderedNodes = selectRenderOrderedNodes(state);

    dragState.hasMoved = true;
    canvasRefs.transform.alignmentGuideRef.current = axisLock || matchedPairGuides ? null : guide;
    canvasRefs.transform.equalSpacingGuidesRef.current = axisLock || matchedPairGuides ? null : chainGapSnap.guides;
    canvasRefs.transform.matchedPairGuidesRef.current = axisLock ? null : matchedPairGuides;

    updateDragDropTarget(dispatch, state, selectedNodes, rawPoint, renderOrderedNodes, nodes, canvasRefs);
    setClassName(axisLock && AXIS_LOCK_CLASS_NAME[axisLock]);
    initDraggedNodeIds(canvasRefs, dragState);
    updateDragSnapshotDeltas(snapshots, deltaX, deltaY);
    dispatchDraggedNodeUpdates(dispatch, dragState, snapshots, deltaX, deltaY);
  }
};
