// others
import { ALIGNMENT_SNAP_TOLERANCE_PX } from 'constant/canvas';

// store
import { selectActiveTool, selectNodes, selectViewport } from 'store/design/selectors';
import { store } from 'store';

// types
import { ToolName } from 'types/design/enums';
import { TAlignmentGuide } from 'components/Design/Canvas/utils/getGroupAlignmentGuide';
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getPointAlignmentSnap } from 'components/Design/Canvas/utils/getPointAlignmentSnap';
import { getPointerPosition } from '../../../../../utils/getPointerPosition';
import { getResizeAnchorSolver } from './getResizeAnchorSolver';
import { getResizeOrScaleFactors } from './getResizeOrScaleFactors';
import { getResizeQueryPoint } from './getResizeQueryPoint';
import { screenToWorld } from '../../../../../utils/screenToWorld';

export type TResizeDragFrame = {
  alignmentGuide: TAlignmentGuide | null;
  anchors: { x: number | null; y: number | null };
  rotatedAnchorSolver: ((width: number, height: number) => TPoint) | null;
  scaleX: number;
  scaleY: number;
};

type TSingleRotatableOrigin = Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number }> | null;

const isSnappableSingleOrigin = (origin: TSingleRotatableOrigin): boolean => !origin || (origin.rotation === 0 && 'width' in origin);

export const getResizeDragFrame = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  bounds: TDraftRect,
  handle: TResizeHandle,
  aspectRatio: number,
  singleRotatableOrigin: TSingleRotatableOrigin,
  excludedIds: string[],
): TResizeDragFrame => {
  const isScaleTool = selectActiveTool(store.getState()) === ToolName.scale;
  const viewport = selectViewport(store.getState());
  const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
  const queryPoint = getResizeQueryPoint(rawPoint, bounds, singleRotatableOrigin);
  const snap = isSnappableSingleOrigin(singleRotatableOrigin)
    ? getPointAlignmentSnap(queryPoint, selectNodes(store.getState()), excludedIds, ALIGNMENT_SNAP_TOLERANCE_PX / viewport.zoom)
    : { guide: null, point: queryPoint };
  const { anchors, scaleX, scaleY } = getResizeOrScaleFactors(isScaleTool, handle, bounds, snap.point, aspectRatio, event.shiftKey);
  const rotatedAnchorSolver = getResizeAnchorSolver(bounds, handle, scaleX, scaleY, singleRotatableOrigin);

  return { alignmentGuide: snap.guide, anchors, rotatedAnchorSolver, scaleX, scaleY };
};
