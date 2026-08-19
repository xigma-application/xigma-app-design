// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getRotatedAnchorSolver } from './getRotatedAnchorSolver';

export const getResizeAnchorSolver = (
  bounds: TDraftRect,
  handle: TResizeHandle,
  scaleX: number,
  scaleY: number,
  singleRotatableOrigin: Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number }> | null,
): ((width: number, height: number) => TPoint) | null =>
  singleRotatableOrigin && singleRotatableOrigin.rotation !== 0
    ? getRotatedAnchorSolver(bounds, handle, singleRotatableOrigin.rotation, scaleX, scaleY)
    : null;
