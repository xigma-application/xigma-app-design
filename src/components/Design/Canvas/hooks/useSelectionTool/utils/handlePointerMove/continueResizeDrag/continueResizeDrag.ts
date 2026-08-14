import { RefObject } from 'react';

// store
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TResizeDragState } from '../../../types';

// utils
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { getResizeAnchorSolver } from './getResizeAnchorSolver';
import { getResizeOrScaleFactors } from './getResizeOrScaleFactors';
import { getResizeQueryPoint } from './getResizeQueryPoint';
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
    const isScaleTool = selectActiveTool(store.getState()) === ToolName.scale;
    const rawPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
    const point = getResizeQueryPoint(rawPoint, bounds, singleBoxOrigin);
    const { anchors, scaleX, scaleY } = getResizeOrScaleFactors(isScaleTool, handle, bounds, point, aspectRatio, event.shiftKey);
    const rotatedAnchorSolver = getResizeAnchorSolver(bounds, handle, scaleX, scaleY, singleBoxOrigin);

    originEntries.forEach(([id, origin]) => {
      resizeNode(id, origin, dispatch, anchors, scaleX, scaleY, Boolean(singleBoxOrigin), rotatedAnchorSolver);
    });
  }
};
