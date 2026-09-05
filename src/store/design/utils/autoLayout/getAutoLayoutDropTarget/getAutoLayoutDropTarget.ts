// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAlignmentComponents } from '../getAlignmentComponents';
import { getAutoLayoutChildPositions, TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { getAutoLayoutContentBox, TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { getAutoLayoutDropIndicator, TAutoLayoutDropIndicator } from './getAutoLayoutDropIndicator';
import { getAutoLayoutDropInsertionIndex } from './getAutoLayoutDropInsertionIndex';
import { getAutoLayoutInsertedPosition } from './getAutoLayoutInsertedPosition';
import { getAutoLayoutSiblingPositions } from './getAutoLayoutSiblingPositions';

export type TAutoLayoutDropTarget = {
  index: number;
  indicator: TAutoLayoutDropIndicator;
  siblingPositions: Record<string, TPoint>;
};

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
  const { x: xAlign, y: yAlign } = getAlignmentComponents(alignment);
  const primaryAlign = isHorizontal ? xAlign : yAlign;
  const insertedPosition = getAutoLayoutInsertedPosition(
    isHorizontal,
    itemSpacing,
    primaryAlign,
    index,
    realPositions,
    children,
    draggedSize,
    simulatedPositions[index],
  );
  const indicator = getAutoLayoutDropIndicator(isHorizontal, frame, draggedSize, insertedPosition);
  const siblingPositions = getAutoLayoutSiblingPositions(simulatedPositions);

  return { index, indicator, siblingPositions };
};
