// others
import { INDICATOR_THICKNESS_PX } from '../constants';

// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { clampToFrameEdge } from './clampToFrameEdge';

export type TAutoLayoutDropIndicator = { height: number; width: number; x: number; y: number };

export const getAutoLayoutDropIndicator = (
  isHorizontal: boolean,
  frame: TDraftRect,
  draggedSize: { height: number; width: number },
  insertedPosition: TPoint,
): TAutoLayoutDropIndicator => {
  const indicatorX = clampToFrameEdge(insertedPosition.x, frame.x);
  const indicatorY = clampToFrameEdge(insertedPosition.y, frame.y);

  return isHorizontal
    ? { height: draggedSize.height, width: INDICATOR_THICKNESS_PX, x: indicatorX, y: indicatorY }
    : { height: INDICATOR_THICKNESS_PX, width: draggedSize.width, x: indicatorX, y: indicatorY };
};
