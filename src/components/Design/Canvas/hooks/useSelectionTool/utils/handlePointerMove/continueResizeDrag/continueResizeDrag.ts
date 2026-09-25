import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TResizeDragState, TResizeNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { applyRotatedGroupChildResize } from './applyRotatedGroupChildResize';
import { getAspectRatioLockGuide } from './getAspectRatioLockGuide';
import { getResizeDragFrame } from './getResizeDragFrame';
import { getSingleRotatableOrigin } from './getSingleRotatableOrigin';
import { resizeOriginEntries } from './resizeOriginEntries';
import { resyncResizedGroupAutoLayoutAncestors } from './resyncResizedGroupAutoLayoutAncestors';
import { updateSectionCaptureIds } from 'components/Design/Canvas/utils/sectionCapture/updateSectionCaptureIds';

const updateResizedSectionCapture = (canvasRefs: TCanvasRefs, nodeId: string | undefined): void => {
  if (nodeId) {
    updateSectionCaptureIds(canvasRefs, nodeId);
  }
};

const initResizedNodeIds = (
  canvasRefs: TCanvasRefs,
  snapshots: TCanvasRefs['vectorSnapshots']['resizedVectorNodeSnapshotsRef']['current'],
): void => {
  if (snapshots && !canvasRefs.transform.resizedNodeIdsRef.current) {
    canvasRefs.transform.resizedNodeIdsRef.current = new Set(snapshots.keys());
  }
};

const applyResizedRotatedGroupChildren = (
  dispatch: AppDispatch,
  originEntries: [string, TResizeNodeOrigin][],
  singleRotatableOrigin: ReturnType<typeof getSingleRotatableOrigin>,
  rotatedGroupChildOrigins: TResizeDragState['rotatedGroupChildOrigins'],
): void => {
  if (rotatedGroupChildOrigins && singleRotatableOrigin) {
    const [groupId] = originEntries[0];
    applyRotatedGroupChildResize(groupId, singleRotatableOrigin, rotatedGroupChildOrigins, dispatch);
  }
};

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
    const nodeId = originEntries.length === 1 ? originEntries[0][0] : undefined;
    const frame = getResizeDragFrame(canvas, event, bounds, handle, aspectRatio, singleRotatableOrigin, candidateShapes, nodeId);
    const snapshots = canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current;
    const nodesIds = originEntries.map(([id]) => id);

    canvasRefs.transform.alignmentGuideRef.current = frame.alignmentGuide;
    initResizedNodeIds(canvasRefs, snapshots);
    resizeOriginEntries(originEntries, dispatch, frame, Boolean(singleRotatableOrigin), snapshots);
    resyncResizedGroupAutoLayoutAncestors(dispatch, nodesIds);
    updateResizedSectionCapture(canvasRefs, nodeId);
    applyResizedRotatedGroupChildren(dispatch, originEntries, singleRotatableOrigin, rotatedGroupChildOrigins);
    canvasRefs.transform.aspectRatioLockGuideRef.current = getAspectRatioLockGuide(frame.isAspectLocked, singleRotatableOrigin, nodeId);
  }
};
