// types
import { SizingMode } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TFrameNode, TGridTrackSize } from 'types/design/types';

// utils
import { applyGridHugSizing } from './applyGridHugSizing';
import { buildGridTracks } from './buildGridTracks';
import { getGridChildPositions } from './getGridChildPositions';
import { getGridContentMaxPerTrack } from './getGridContentMaxPerTrack';
import { placeGridCells } from '../placeGridCells/placeGridCells';
import { resolveGridTrackSizes } from '../resolveGridTrackSizes';
import { TAutoLayoutPadding } from '../../getAutoLayoutContentBox';

export type TResolveGridLayoutInput = {
  autoPlacement: boolean;
  columnCount: number;
  columnGap: number;
  columnSizes?: TGridTrackSize[];
  frame: TFrameNode;
  isHeightHug: boolean;
  isWidthHug: boolean;
  padding: TAutoLayoutPadding;
  rowCount?: number;
  rowGap: number;
  rowSizes?: TGridTrackSize[];
  sizes: TAutoLayoutChildSize[];
};

const DEFAULT_TRACK: TGridTrackSize = { mode: SizingMode.fill, value: 1 };

export const resolveGridLayout = (input: TResolveGridLayoutInput): TAutoLayoutChildPosition[] => {
  const { autoPlacement, columnCount, columnGap, columnSizes, frame, isHeightHug, isWidthHug, padding, rowGap, rowSizes, sizes } = input;
  const placements = placeGridCells(sizes, columnCount, autoPlacement);
  const derivedRowCount = placements.reduce((max, placement) => Math.max(max, placement.rowStart + placement.rowSpan), 1);
  const rowCount = Math.max(Math.round(input.rowCount ?? derivedRowCount), derivedRowCount);
  const columnTracks = buildGridTracks(columnCount, columnSizes, DEFAULT_TRACK);
  const rowTracks = buildGridTracks(rowCount, rowSizes, DEFAULT_TRACK);
  const contentMaxPerColumn = getGridContentMaxPerTrack(placements, sizes, columnCount, true);
  const contentMaxPerRow = getGridContentMaxPerTrack(placements, sizes, rowCount, false);
  const availableColumn = isWidthHug ? 0 : frame.width - padding.paddingLeft - padding.paddingRight;
  const availableRow = isHeightHug ? 0 : frame.height - padding.paddingTop - padding.paddingBottom;
  const columnTrackSizes = resolveGridTrackSizes(columnTracks, availableColumn, columnGap, isWidthHug, contentMaxPerColumn);
  const rowTrackSizes = resolveGridTrackSizes(rowTracks, availableRow, rowGap, isHeightHug, contentMaxPerRow);

  applyGridHugSizing({
    columnCount,
    columnGap,
    columnTrackSizes,
    frame,
    isHeightHug,
    isWidthHug,
    padding,
    rowCount,
    rowGap,
    rowTrackSizes,
  });

  return getGridChildPositions({
    columnGap,
    columnTrackSizes,
    frame,
    padding,
    placements,
    rowGap,
    rowTrackSizes,
    sizes,
  });
};
