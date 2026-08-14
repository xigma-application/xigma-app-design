import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TResizeDragState } from '../../../types';

// utils
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { getResizeAnchorPoint } from '../../../../../utils/getResizeAnchorPoint';
import { getResizeAnchorSolver } from './getResizeAnchorSolver';
import { getResizeAxisAnchors } from '../../../../../utils/getResizeAxisAnchors';
import { getResizeBounds } from './getResizeBounds';
import { getResizeQueryPoint } from './getResizeQueryPoint';
import { getSignedScale } from './getSignedScale';
import { resizeNode } from './resizeNode/resizeNode';
import { screenToWorld } from '../../../../../utils/screenToWorld';

export const continueResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  resizeDragRef: RefObject<TResizeDragState | null>,
): void => {
  const resizeDragState = resizeDragRef.current;

  if (resizeDragState) {
    const { aspectRatio, bounds, handle, nodeOrigins } = resizeDragState;
    const originEntries = Object.entries(nodeOrigins);
    const [singleOriginEntry] = originEntries;
    const singleBoxOrigin = originEntries.length === 1 && !('x1' in singleOriginEntry[1]) ? singleOriginEntry[1] : null;
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const point = getResizeQueryPoint(rawPoint, bounds, singleBoxOrigin);
    const cornerAnchor = getResizeAnchorPoint(handle, bounds);
    const newBounds = getResizeBounds(handle, bounds, point, cornerAnchor, aspectRatio, event.shiftKey);
    const anchors = getResizeAxisAnchors(handle, bounds);
    const scaleX = getSignedScale(newBounds.x, newBounds.width, bounds.x, bounds.width, anchors.x);
    const scaleY = getSignedScale(newBounds.y, newBounds.height, bounds.y, bounds.height, anchors.y);
    const rotatedAnchorSolver = getResizeAnchorSolver(bounds, handle, scaleX, scaleY, singleBoxOrigin);

    originEntries.forEach(([id, origin]) => {
      resizeNode(id, origin, dispatch, anchors, scaleX, scaleY, Boolean(singleBoxOrigin), rotatedAnchorSolver);
    });
  }
};
