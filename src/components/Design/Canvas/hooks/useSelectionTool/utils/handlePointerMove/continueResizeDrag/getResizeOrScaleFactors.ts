// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

// utils
import { getResizeFactors, TResizeFactors } from './getResizeFactors';
import { getScaleFactors } from './getScaleFactors';

export const getResizeOrScaleFactors = (
  isScaleTool: boolean,
  handle: TResizeHandle,
  bounds: TDraftRect,
  point: TPoint,
  aspectRatio: number,
  shiftKey: boolean,
): TResizeFactors =>
  isScaleTool ? getScaleFactors(handle, bounds, point, aspectRatio) : getResizeFactors(handle, bounds, point, aspectRatio, shiftKey);
