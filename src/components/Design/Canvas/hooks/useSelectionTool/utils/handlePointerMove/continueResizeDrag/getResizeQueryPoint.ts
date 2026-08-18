// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getUnrotatedQueryPoint } from '../../../../../utils/getUnrotatedQueryPoint';

export const getResizeQueryPoint = (
  rawPoint: TPoint,
  bounds: TDraftRect,
  singleBoxOrigin: Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number }> | null,
): TPoint =>
  singleBoxOrigin && singleBoxOrigin.rotation !== 0 ? getUnrotatedQueryPoint(rawPoint, bounds, singleBoxOrigin.rotation) : rawPoint;
