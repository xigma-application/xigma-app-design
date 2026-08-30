import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { applyRotatedGroupChildResize } from './applyRotatedGroupChildResize';
import { getResizeDragFrame } from './getResizeDragFrame';
import { getSingleRotatableOrigin } from './getSingleRotatableOrigin';
import { resizeOriginEntries } from './resizeOriginEntries';

export const continueResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  resizeDragRef: RefObject<TResizeDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const resizeDragState = resizeDragRef.current;

  if (resizeDragState) {
    const { aspectRatio, bounds, candidateShapes, handle, nodeOrigins, rotatedGroupChildOrigins } = resizeDragState;
    const originEntries = Object.entries(nodeOrigins);
    const singleRotatableOrigin = getSingleRotatableOrigin(originEntries);
    const frame = getResizeDragFrame(canvas, event, bounds, handle, aspectRatio, singleRotatableOrigin, candidateShapes);
    const snapshots = canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current;
    canvasRefs.transform.alignmentGuideRef.current = frame.alignmentGuide;

    if (snapshots && !canvasRefs.transform.resizedNodeIdsRef.current) {
      canvasRefs.transform.resizedNodeIdsRef.current = new Set(snapshots.keys());
    }

    resizeOriginEntries(originEntries, dispatch, frame, Boolean(singleRotatableOrigin), snapshots);

    if (rotatedGroupChildOrigins && singleRotatableOrigin) {
      const [groupId] = originEntries[0];

      applyRotatedGroupChildResize(groupId, singleRotatableOrigin, rotatedGroupChildOrigins, dispatch);
    }
  }
};
