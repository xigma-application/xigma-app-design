// types
import { LayoutVersion } from 'types/design/enums';
import { TAutoLayoutPadding } from 'store/design/utils/autoLayout/getAutoLayoutContentBox';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getFrameLayoutPadding } from 'store/design/utils/autoLayout/getFrameLayoutPadding';
import { getGridResolvedTrackSizes } from 'store/design/utils/autoLayout/getGridResolvedTrackSizes';

export type TGridTrackLayout = {
  columnCount: number;
  columnGap: number;
  columnSizes: number[];
  padding: TAutoLayoutPadding;
  rowCount: number;
  rowGap: number;
  rowSizes: number[];
};

export const getGridTrackLayout = (frame: TFrameNode, nodesById: Record<string, TSceneNode>): TGridTrackLayout => {
  const { column, row } = getGridResolvedTrackSizes(frame, nodesById);

  return {
    columnCount: column.length,
    columnGap: frame.horizontalGap ?? 0,
    columnSizes: column,
    padding: getFrameLayoutPadding(frame, frame.layoutVersion ?? LayoutVersion.updated),
    rowCount: row.length,
    rowGap: frame.verticalGap ?? 0,
    rowSizes: row,
  };
};
