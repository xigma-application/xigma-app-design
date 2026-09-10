// types
import { LayoutVersion } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getEffectiveGridRowCount } from 'store/design/utils/autoLayout/getEffectiveGridRowCount';
import { getFrameLayoutPadding } from 'store/design/utils/autoLayout/getFrameLayoutPadding';

export const getGridSlotRects = (frame: TFrameNode, nodesById: Record<string, TSceneNode>): TDraftRect[] => {
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const childCount = frame.childIds.filter((id) => nodesById[id]).length;
  const derivedRowCount = getEffectiveGridRowCount(childCount, columnCount);
  const rowCount = Math.max(Math.round(frame.gridRowCount ?? derivedRowCount), derivedRowCount);
  const columnGap = frame.horizontalGap ?? 0;
  const rowGap = frame.verticalGap ?? 0;
  const padding = getFrameLayoutPadding(frame, frame.layoutVersion ?? LayoutVersion.updated);
  const contentWidth = frame.width - padding.paddingLeft - padding.paddingRight;
  const contentHeight = frame.height - padding.paddingTop - padding.paddingBottom;
  const columnSize = Math.max((contentWidth - (columnCount - 1) * columnGap) / columnCount, 0);
  const rowSize = Math.max((contentHeight - (rowCount - 1) * rowGap) / rowCount, 0);
  const rects: TDraftRect[] = [];

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < columnCount; column += 1) {
      rects.push({
        height: rowSize,
        width: columnSize,
        x: frame.x + padding.paddingLeft + column * (columnSize + columnGap),
        y: frame.y + padding.paddingTop + row * (rowSize + rowGap),
      });
    }
  }

  return rects;
};
