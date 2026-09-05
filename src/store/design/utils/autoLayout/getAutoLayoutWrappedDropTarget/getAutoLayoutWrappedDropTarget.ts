// types
import { AlignmentLayout, LayoutMode } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { TDraftRect, TPoint } from 'types/canvas';
import { type TAutoLayoutDropTarget } from '../getAutoLayoutDropTarget/getAutoLayoutDropTarget';

// utils
import { getAutoLayoutContentBox, type TAutoLayoutPadding } from '../getAutoLayoutContentBox';
import { getAutoLayoutWrappedChildPositions } from '../getAutoLayoutWrappedChildPositions';
import { getAutoLayoutWrappedRowBounds } from './getAutoLayoutWrappedRowBounds';
import { getAutoLayoutWrappedRowDropTarget } from './getAutoLayoutWrappedRowDropTarget';
import { getAutoLayoutWrappedSiblingPositions } from './getAutoLayoutWrappedSiblingPositions';

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
  cursorPoint: TPoint,
): TAutoLayoutDropTarget => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  const contentBox = getAutoLayoutContentBox(frame, padding);
  const realPositions = getAutoLayoutWrappedChildPositions(layoutMode, itemSpacing, counterAxisSpacing, alignment, contentBox, children);
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
  const siblingPositions = getAutoLayoutWrappedSiblingPositions(
    layoutMode,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    children,
    index,
    draggedSize,
  );

  return { index, indicator: rowDropTarget.indicator, siblingPositions };
};
