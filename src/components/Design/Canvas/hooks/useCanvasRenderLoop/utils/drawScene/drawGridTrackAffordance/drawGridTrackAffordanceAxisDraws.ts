// types
import { TCanvasRefs, TGridTrackAffordanceDragState, TGridTrackSelection } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TFrameNode } from 'types/design/types';
import { TGridTrackAxis } from 'store/design/utils/autoLayout/gridTracks/types';
import { TGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';
import { TPoint } from 'types/canvas';

// utils
import { buildGridTracks } from 'store/design/utils/autoLayout/computeGridLayoutPositions/resolveGridLayout/buildGridTracks';
import { DEFAULT_GRID_TRACK } from 'store/design/utils/autoLayout/gridTracks/buildGridTrackList';
import { drawGridTrackAffordanceAxis } from './drawGridTrackAffordanceAxis';
import { getGridTrackAffordanceAxisDraws, TGridTrackAffordanceDraw } from 'utils/canvas/gridSlots/getGridTrackAffordanceAxisDraws';
import { getGridTrackAffordancePillCenters } from 'utils/canvas/gridSlots/getGridTrackAffordancePillCenters';
import { isGridTrackAffordanceDrawSuppressed } from 'utils/canvas/gridSlots/isGridTrackAffordanceDrawSuppressed';

const getVisibleGridTrackAffordanceDraws = (
  axis: TGridTrackAxis,
  hover: TCanvasRefs['hover']['hoveredGridTrackAffordanceRef']['current'],
  selection: TGridTrackSelection | null,
  dragState: TGridTrackAffordanceDragState | null,
): TGridTrackAffordanceDraw[] =>
  getGridTrackAffordanceAxisDraws(axis, hover, selection).filter(
    (draw) => !isGridTrackAffordanceDrawSuppressed(axis, draw.index, dragState),
  );

export const drawGridTrackAffordanceAxisDraws = (
  context: TDrawSceneContext,
  frame: TFrameNode,
  layout: TGridTrackLayout,
  axis: TGridTrackAxis,
  hover: TCanvasRefs['hover']['hoveredGridTrackAffordanceRef']['current'],
  selection: TGridTrackSelection | null,
  offset: number,
  frameCenter: TPoint,
  dragState: TGridTrackAffordanceDragState | null,
): void => {
  const draws = getVisibleGridTrackAffordanceDraws(axis, hover, selection, dragState);
  const trackCount = axis === 'column' ? layout.columnCount : layout.rowCount;
  const providedSizes = axis === 'column' ? frame.gridColumnSizes : frame.gridRowSizes;
  const trackSizes = axis === 'column' ? layout.columnSizes : layout.rowSizes;

  draws.forEach((draw) => {
    const cell = { column: axis === 'column' ? draw.index : 0, row: axis === 'row' ? draw.index : 0 };
    const pillCenters = getGridTrackAffordancePillCenters(frame, layout, cell, offset);
    const track = buildGridTracks(trackCount, providedSizes, DEFAULT_GRID_TRACK)[draw.index] ?? DEFAULT_GRID_TRACK;

    drawGridTrackAffordanceAxis(
      context,
      pillCenters[axis],
      axis,
      draw.isExpanded,
      draw.handlePart,
      track,
      trackSizes[draw.index] ?? 0,
      frame.rotation,
      frameCenter,
    );
  });
};
