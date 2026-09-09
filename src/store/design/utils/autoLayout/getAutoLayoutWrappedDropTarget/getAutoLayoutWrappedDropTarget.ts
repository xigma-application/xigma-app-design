// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDraftRect, TPoint } from 'types/canvas';
import { type TAutoLayoutDropTarget } from '../getAutoLayoutDropTarget/getAutoLayoutDropTarget';

// utils
import { getAutoLayoutContentBox, type TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { getAutoLayoutReorderOriginChildren } from './getAutoLayoutReorderOriginChildren';
import { getAutoLayoutWrappedChildPositions } from '../getAutoLayoutWrappedChildPositions/getAutoLayoutWrappedChildPositions';
import { getAutoLayoutWrappedRowBounds } from './getAutoLayoutWrappedRowBounds';
import { getAutoLayoutWrappedRowDropTarget } from './getAutoLayoutWrappedRowDropTarget';
import { getAutoLayoutWrappedSiblingPositions } from './getAutoLayoutWrappedSiblingPositions';
import { groupAutoLayoutChildrenIntoLines } from '../groupAutoLayoutChildrenIntoLines';

export const getAutoLayoutWrappedDropTarget = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  frame: TDraftRect,
  padding: TAutoLayoutPadding,
  children: TAutoLayoutChildSize[],
  originalIndex: number | null,
  draggedSize: { height: number; width: number },
  draggedSizes: TAutoLayoutChildSize[],
  cursorPoint: TPoint,
): TAutoLayoutDropTarget => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const contentBox = getAutoLayoutContentBox(frame, padding);
  const availablePrimary = isHorizontal ? contentBox.width : contentBox.height;
  const originChildren = getAutoLayoutReorderOriginChildren(children, originalIndex, draggedSize);
  const originLines = groupAutoLayoutChildrenIntoLines(isHorizontal, itemSpacing, availablePrimary, originChildren);
  const realPositions = getAutoLayoutWrappedChildPositions(
    layoutMode,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    originLines,
  ).filter((position) => position.id !== '__dragged__');
  const { realEnd, realStart, rowFrame, rowOriginalIndex } = getAutoLayoutWrappedRowBounds(
    isHorizontal,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    children,
    originalIndex,
    draggedSize,
    cursorPoint,
  );
  const rowDropTarget = getAutoLayoutWrappedRowDropTarget(
    layoutMode,
    itemSpacing,
    alignment,
    rowFrame,
    children,
    realPositions,
    realStart,
    realEnd,
    rowOriginalIndex,
    draggedSize,
    cursorPoint,
  );
  const index = realStart + rowDropTarget.index;
  const siblingPositions = getAutoLayoutWrappedSiblingPositions({
    alignment,
    children,
    contentBox,
    counterAxisSpacing,
    draggedSizes,
    index,
    itemSpacing,
    layoutMode,
  });

  return { index, indicator: rowDropTarget.indicator, siblingPositions };
};
