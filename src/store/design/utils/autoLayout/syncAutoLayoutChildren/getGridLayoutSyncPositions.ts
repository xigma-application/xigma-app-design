// types
import { LayoutVersion } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TFrameNode } from 'types/design/types';

// utils
import { computeGridLayoutPositions } from '../computeGridLayoutPositions/computeGridLayoutPositions';
import { getFrameLayoutPadding } from '../getFrameLayoutPadding';

export const getGridLayoutSyncPositions = (frame: TFrameNode, sizes: TAutoLayoutChildSize[]): TAutoLayoutChildPosition[] => {
  const layoutVersion = frame.layoutVersion ?? LayoutVersion.updated;

  return computeGridLayoutPositions({
    autoPlacement: frame.gridAutoPlacement ?? true,
    columnCount: Math.max(Math.round(frame.gridColumnCount ?? 1), 1),
    columnGap: frame.horizontalGap ?? 0,
    columnSizes: frame.gridColumnSizes,
    frame,
    layoutVersion,
    padding: getFrameLayoutPadding(frame, layoutVersion),
    rowCount: frame.gridRowCount,
    rowGap: frame.verticalGap ?? 0,
    rowSizes: frame.gridRowSizes,
    sizes,
  });
};
