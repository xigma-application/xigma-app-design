// store
import { selectActiveTool, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { getResizeAnchorSolver } from './getResizeAnchorSolver';
import { getResizeOrScaleFactors } from './getResizeOrScaleFactors';
import { getResizeQueryPoint } from './getResizeQueryPoint';
import { screenToWorld } from '../../../../../utils/screenToWorld';

export type TResizeDragFrame = {
  anchors: { x: number | null; y: number | null };
  rotatedAnchorSolver: ((width: number, height: number) => TPoint) | null;
  scaleX: number;
  scaleY: number;
};

export const getResizeDragFrame = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  bounds: TDraftRect,
  handle: TResizeHandle,
  aspectRatio: number,
  singleRotatableOrigin: Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number }> | null,
): TResizeDragFrame => {
  const isScaleTool = selectActiveTool(store.getState()) === ToolName.scale;
  const rawPoint = screenToWorld(getPointerPosition(canvas, event), selectViewport(store.getState()));
  const point = getResizeQueryPoint(rawPoint, bounds, singleRotatableOrigin);
  const { anchors, scaleX, scaleY } = getResizeOrScaleFactors(isScaleTool, handle, bounds, point, aspectRatio, event.shiftKey);
  const rotatedAnchorSolver = getResizeAnchorSolver(bounds, handle, scaleX, scaleY, singleRotatableOrigin);

  return { anchors, rotatedAnchorSolver, scaleX, scaleY };
};
