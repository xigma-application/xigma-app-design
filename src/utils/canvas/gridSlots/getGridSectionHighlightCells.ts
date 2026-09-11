// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridCellPosition, TGridSectionHighlight, TGridTrackSelection } from 'types/design/canvas/types';

// utils
import { getGridSectionCells } from './getGridSectionCells';
import { getGridTrackLayout } from './getGridTrackLayout';

export type TGridSectionHighlightSource = {
  cells: TGridCellPosition[];
  frameId: string;
};

export const getGridSectionHighlightCells = (
  nodesById: Record<string, TSceneNode>,
  highlight: TGridSectionHighlight | null,
  gridTrackSelection: TGridTrackSelection | null,
): TGridSectionHighlightSource | null => {
  const frameId = gridTrackSelection?.frameId ?? highlight?.frameId ?? null;
  const frame = frameId ? (nodesById[frameId] as TFrameNode | undefined) : undefined;

  if (frameId && frame) {
    if (gridTrackSelection && gridTrackSelection.frameId === frameId) {
      const layout = getGridTrackLayout(frame, nodesById);
      const crossAxisCount = gridTrackSelection.axis === 'column' ? layout.rowCount : layout.columnCount;

      return { cells: getGridSectionCells(gridTrackSelection.axis, gridTrackSelection.indices, crossAxisCount), frameId };
    }

    if (highlight) {
      return { cells: highlight.cells, frameId };
    }
  }

  return null;
};
