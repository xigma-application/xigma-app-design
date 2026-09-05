// others
import { INDICATOR_THICKNESS_PX } from './constants';

// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { clampToFrameEdge } from './clampToFrameEdge';
import { getAutoLayoutChildPositions, TAutoLayoutChildPosition, TAutoLayoutChildSize } from './getAutoLayoutChildPositions';
import { getAutoLayoutContentBox, TAutoLayoutPadding } from './getAutoLayoutContentBox';
import { getAutoLayoutDropInsertionIndex } from './getAutoLayoutDropInsertionIndex';

export type TAutoLayoutDropIndicator = { height: number; width: number; x: number; y: number };

export type TAutoLayoutDropTarget = {
  index: number;
  indicator: TAutoLayoutDropIndicator;
  siblingPositions: Record<string, TPoint>;
};

const getAutoLayoutDropIndicator = (
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

const getAutoLayoutSiblingPositions = (simulatedPositions: TAutoLayoutChildPosition[]): Record<string, TPoint> =>
  simulatedPositions.reduce<Record<string, TPoint>>((positionsById, position) => {
    if (position.id !== '__dragged__') {
      positionsById[position.id] = { x: position.x, y: position.y };
    }

    return positionsById;
  }, {});

export const getAutoLayoutDropTarget = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  alignment: AlignmentLayout,
  frame: TDraftRect,
  padding: TAutoLayoutPadding,
  children: TAutoLayoutChildSize[],
  realPositions: TAutoLayoutChildPosition[],
  originalIndex: number | null,
  draggedSize: { height: number; width: number },
  cursorPoint: TPoint,
): TAutoLayoutDropTarget => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const contentBox = getAutoLayoutContentBox(frame, padding);
  const cursorPrimary = isHorizontal ? cursorPoint.x : cursorPoint.y;
  const index = getAutoLayoutDropInsertionIndex(isHorizontal, cursorPrimary, realPositions, children, originalIndex);
  const simulatedChildren = [...children.slice(0, index), { ...draggedSize, id: '__dragged__' }, ...children.slice(index)];
  const simulatedPositions = getAutoLayoutChildPositions(layoutMode, itemSpacing, alignment, contentBox, simulatedChildren);
  const insertedPosition = simulatedPositions[index];
  const indicator = getAutoLayoutDropIndicator(isHorizontal, frame, draggedSize, insertedPosition);
  const siblingPositions = getAutoLayoutSiblingPositions(simulatedPositions);

  return { index, indicator, siblingPositions };
};
