// types
import { LayoutVersion, SizingMode } from 'types/design/enums';
import { TFrameNode, TGridTrackSize, TSceneNode } from 'types/design/types';

// utils
import { buildGridTracks } from './computeGridLayoutPositions/resolveGridLayout/buildGridTracks';
import { getAutoLayoutSyncChildren } from './syncAutoLayoutChildren/getAutoLayoutSyncChildren';
import { getFrameLayoutPadding } from './getFrameLayoutPadding';
import { getGridContentMaxPerTrack } from './computeGridLayoutPositions/resolveGridLayout/getGridContentMaxPerTrack';
import { placeGridCells } from './computeGridLayoutPositions/placeGridCells/placeGridCells';
import { resolveGridTrackSizes } from './computeGridLayoutPositions/resolveGridTrackSizes';

const DEFAULT_TRACK: TGridTrackSize = { mode: SizingMode.fill, value: 1 };

export const getGridResolvedTrackSizes = (
  frame: TFrameNode,
  nodesById: Record<string, TSceneNode>,
): { column: number[]; row: number[] } => {
  const { sizes } = getAutoLayoutSyncChildren(frame, nodesById);
  const padding = getFrameLayoutPadding(frame, frame.layoutVersion ?? LayoutVersion.updated);
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const columnGap = frame.horizontalGap ?? 0;
  const rowGap = frame.verticalGap ?? 0;
  const isWidthHug = frame.widthSizingMode === SizingMode.hug;
  const isHeightHug = frame.heightSizingMode === SizingMode.hug;
  const placements = placeGridCells(sizes, columnCount, frame.gridAutoPlacement ?? true);
  const derivedRowCount = placements.reduce((max, placement) => Math.max(max, placement.rowStart + placement.rowSpan), 1);
  const rowCount = Math.max(Math.round(frame.gridRowCount ?? derivedRowCount), derivedRowCount);
  const columnTracks = buildGridTracks(columnCount, frame.gridColumnSizes, DEFAULT_TRACK);
  const rowTracks = buildGridTracks(rowCount, frame.gridRowSizes, DEFAULT_TRACK);
  const availableColumn = isWidthHug ? 0 : frame.width - padding.paddingLeft - padding.paddingRight;
  const availableRow = isHeightHug ? 0 : frame.height - padding.paddingTop - padding.paddingBottom;

  return {
    column: resolveGridTrackSizes(
      columnTracks,
      availableColumn,
      columnGap,
      isWidthHug,
      getGridContentMaxPerTrack(placements, sizes, columnCount, true),
    ),
    row: resolveGridTrackSizes(rowTracks, availableRow, rowGap, isHeightHug, getGridContentMaxPerTrack(placements, sizes, rowCount, false)),
  };
};
