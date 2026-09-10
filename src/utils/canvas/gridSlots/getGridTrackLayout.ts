// types
import { LayoutVersion } from 'types/design/enums';
import { TAutoLayoutPadding } from 'store/design/utils/autoLayout/getAutoLayoutContentBox';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getDerivedGridRowCount } from 'store/design/utils/autoLayout/getDerivedGridRowCount';
import { getFrameLayoutPadding } from 'store/design/utils/autoLayout/getFrameLayoutPadding';

export type TGridTrackLayout = {
  columnCount: number;
  columnGap: number;
  columnSize: number;
  padding: TAutoLayoutPadding;
  rowCount: number;
  rowGap: number;
  rowSize: number;
};

export const getGridTrackLayout = (frame: TFrameNode, nodesById: Record<string, TSceneNode>): TGridTrackLayout => {
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const derivedRowCount = getDerivedGridRowCount(frame, nodesById);
  const rowCount = Math.max(Math.round(frame.gridRowCount ?? derivedRowCount), derivedRowCount);
  const columnGap = frame.horizontalGap ?? 0;
  const rowGap = frame.verticalGap ?? 0;
  const padding = getFrameLayoutPadding(frame, frame.layoutVersion ?? LayoutVersion.updated);
  const contentWidth = frame.width - padding.paddingLeft - padding.paddingRight;
  const contentHeight = frame.height - padding.paddingTop - padding.paddingBottom;
  const columnSize = Math.max((contentWidth - (columnCount - 1) * columnGap) / columnCount, 0);
  const rowSize = Math.max((contentHeight - (rowCount - 1) * rowGap) / rowCount, 0);

  return { columnCount, columnGap, columnSize, padding, rowCount, rowGap, rowSize };
};
