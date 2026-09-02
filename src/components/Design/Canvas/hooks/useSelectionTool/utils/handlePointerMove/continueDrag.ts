import { RefObject } from 'react';

// others
import { ALIGNMENT_SNAP_TOLERANCE_PX, EQUAL_SPACING_SNAP_TOLERANCE_PX } from 'constant/canvas';

// store
import { updateNode } from 'store/design/slice';
import { selectNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';

// utils
import { getChainGapDragSnap } from './getChainGapDragSnap';
import { getDragAlignmentSnap } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getDragAlignmentSnap';
import { getGeometryDeltaChanges } from '../../../../utils/getGeometryDeltaChanges';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { scheduleThrottledDispatch } from 'components/Design/Canvas/utils/scheduleThrottledDispatch';
import { screenToWorld } from '../../../../utils/screenToWorld';

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

    dragState.hasMoved = true;
    canvasRefs.transform.alignmentGuideRef.current = guide;
    canvasRefs.transform.equalSpacingGuidesRef.current = chainGapSnap.guides;

    if (!canvasRefs.transform.draggedNodeIdsRef.current) {
      canvasRefs.transform.draggedNodeIdsRef.current = new Set(Object.keys(dragState.nodeOrigins));
    }

    snapshots?.forEach((snapshot) => {
      snapshot.deltaX = deltaX;
      snapshot.deltaY = deltaY;
    });

    scheduleThrottledDispatch(dragState.dispatchThrottle, () =>
      Object.entries(dragState.nodeOrigins).forEach(([id, origin]) => {
        if (!snapshots?.has(id)) {
          dispatch(updateNode({ changes: getGeometryDeltaChanges(origin, deltaX, deltaY), id }));
        }
      }),
    );
  }
};
