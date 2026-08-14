// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';
import { TResizeNodeOrigin } from '../../../types';

// utils
import { getRotatedAnchorSolver } from './getRotatedAnchorSolver';

export const getResizeAnchorSolver = (
  bounds: TDraftRect,
  handle: TResizeHandle,
  scaleX: number,
  scaleY: number,
  singleBoxOrigin: Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number }> | null,
): ((width: number, height: number) => TPoint) | null =>
  singleBoxOrigin && singleBoxOrigin.rotation !== 0
    ? getRotatedAnchorSolver(bounds, handle, singleBoxOrigin.rotation, scaleX, scaleY)
    : null;
