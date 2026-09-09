// types
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TFrameNode } from 'types/design/types';
import { TGridCellPlacement } from '../types';

// utils
import { getAutoLayoutContentBox, TAutoLayoutPadding } from '../../getAutoLayoutContentBox';
import { getGridCellRect } from '../getGridCellRect';
import { getGridChildPosition } from '../getGridChildPosition';
import { getGridTrackOffsets } from '../getGridTrackOffsets';

export type TGetGridChildPositionsInput = {
  columnGap: number;
  columnTrackSizes: number[];
  frame: TFrameNode;
  padding: TAutoLayoutPadding;
  placements: TGridCellPlacement[];
  rowGap: number;
  rowTrackSizes: number[];
  sizes: TAutoLayoutChildSize[];
};

export const getGridChildPositions = (input: TGetGridChildPositionsInput): TAutoLayoutChildPosition[] => {
  const { columnGap, columnTrackSizes, frame, padding, placements, rowGap, rowTrackSizes, sizes } = input;
  const contentBox = getAutoLayoutContentBox(frame, padding);
  const columnOffsets = getGridTrackOffsets(columnTrackSizes, columnGap, contentBox.x);
  const rowOffsets = getGridTrackOffsets(rowTrackSizes, rowGap, contentBox.y);

  return placements.map((placement, index) => {
    const cell = getGridCellRect(placement, columnOffsets, rowOffsets, columnTrackSizes, rowTrackSizes);
    return getGridChildPosition(sizes[index], cell);
  });
};
