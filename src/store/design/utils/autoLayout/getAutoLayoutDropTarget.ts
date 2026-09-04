// others
import { INDICATOR_THICKNESS_PX } from './constants';

// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { clampToFrameEdge } from './clampToFrameEdge';
import { getAutoLayoutChildPositions, TAutoLayoutChildSize } from './getAutoLayoutChildPositions';
import { getAutoLayoutContentBox, TAutoLayoutPadding } from './getAutoLayoutContentBox';
import { getAutoLayoutDropInsertionIndex } from './getAutoLayoutDropInsertionIndex';

export type TAutoLayoutDropIndicator = { height: number; width: number; x: number; y: number };

export type TAutoLayoutDropTarget = { index: number; indicator: TAutoLayoutDropIndicator };

export const getAutoLayoutDropTarget = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  alignment: AlignmentLayout,
  frame: TDraftRect,
  padding: TAutoLayoutPadding,
  children: TAutoLayoutChildSize[],
  draggedSize: { height: number; width: number },
  cursorPoint: TPoint,
): TAutoLayoutDropTarget => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const contentBox = getAutoLayoutContentBox(frame, padding);
  const positions = getAutoLayoutChildPositions(layoutMode, itemSpacing, alignment, contentBox, children);
  const cursorPrimary = isHorizontal ? cursorPoint.x : cursorPoint.y;
  const index = getAutoLayoutDropInsertionIndex(isHorizontal, cursorPrimary, positions, children);
  const simulatedChildren = [...children.slice(0, index), { ...draggedSize, id: '__dragged__' }, ...children.slice(index)];
  const insertedPosition = getAutoLayoutChildPositions(layoutMode, itemSpacing, alignment, contentBox, simulatedChildren)[index];
  const indicatorX = clampToFrameEdge(insertedPosition.x, frame.x);
  const indicatorY = clampToFrameEdge(insertedPosition.y, frame.y);
  const indicator = isHorizontal
    ? { height: draggedSize.height, width: INDICATOR_THICKNESS_PX, x: indicatorX, y: indicatorY }
    : { height: INDICATOR_THICKNESS_PX, width: draggedSize.width, x: indicatorX, y: indicatorY };

  return { index, indicator };
};
