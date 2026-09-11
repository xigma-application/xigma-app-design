// store
import { getAutoLayoutFrameCenter } from 'store/design/utils/autoLayout/getAutoLayoutFrameCenter';
import { getSelectedGridFrame } from 'store/design/utils/autoLayout/getSelectedGridFrame';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { buildGridTracks } from 'store/design/utils/autoLayout/computeGridLayoutPositions/resolveGridLayout/buildGridTracks';
import { DEFAULT_GRID_TRACK } from 'store/design/utils/autoLayout/gridTracks/buildGridTrackList';
import { drawGridTrackAffordanceAxis } from './drawGridTrackAffordanceAxis';
import { getGridTrackAffordancePillCenters } from 'utils/canvas/gridSlots/getGridTrackAffordancePillCenters';
import { getGridTrackAffordancePillOffset } from 'utils/canvas/gridSlots/getGridTrackAffordancePillOffset';
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';

export const drawGridTrackAffordance = (
  context: TDrawSceneContext,
  selectedNodes: TSceneNode[],
  refs: TCanvasRefs,
  nodesById: Record<string, TSceneNode>,
): void => {
  const frame = getSelectedGridFrame(selectedNodes);
  const hover = refs.hover.hoveredGridTrackAffordanceRef.current;

  if (frame && hover && hover.frameId === frame.id) {
    const layout = getGridTrackLayout(frame, nodesById);
    const frameCenter = getAutoLayoutFrameCenter(frame);
    const offset = getGridTrackAffordancePillOffset(context.viewport.zoom);
    const pillCenters = getGridTrackAffordancePillCenters(frame, layout, { column: hover.columnIndex, row: hover.rowIndex }, offset);
    const rowTrack = buildGridTracks(layout.rowCount, frame.gridRowSizes, DEFAULT_GRID_TRACK)[hover.rowIndex] ?? DEFAULT_GRID_TRACK;
    const columnTrack =
      buildGridTracks(layout.columnCount, frame.gridColumnSizes, DEFAULT_GRID_TRACK)[hover.columnIndex] ?? DEFAULT_GRID_TRACK;

    drawGridTrackAffordanceAxis(
      context,
      pillCenters.column,
      'column',
      hover.hoveredPillAxis === 'column',
      hover.hoveredPillAxis === 'column' ? hover.hoveredHandlePart : null,
      columnTrack,
      layout.columnSizes[hover.columnIndex] ?? 0,
      frame.rotation,
      frameCenter,
    );
    drawGridTrackAffordanceAxis(
      context,
      pillCenters.row,
      'row',
      hover.hoveredPillAxis === 'row',
      hover.hoveredPillAxis === 'row' ? hover.hoveredHandlePart : null,
      rowTrack,
      layout.rowSizes[hover.rowIndex] ?? 0,
      frame.rotation,
      frameCenter,
    );
  }
};
