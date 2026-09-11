// store
import { getSelectedGridFrame } from 'store/design/utils/autoLayout/getSelectedGridFrame';

// types
import { THoverResolverContext, THoverResult } from '../types';
import { TGridTrackAffordanceHandlePart } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { buildGridTracks } from 'store/design/utils/autoLayout/computeGridLayoutPositions/resolveGridLayout/buildGridTracks';
import { DEFAULT_GRID_TRACK } from 'store/design/utils/autoLayout/gridTracks/buildGridTrackList';
import { getGridDropCell } from 'utils/canvas/gridSlots/getGridDropCell';
import { getGridTrackAffordanceHoveredHandlePart } from 'utils/canvas/gridSlots/getGridTrackAffordanceHoveredHandlePart';
import { getGridTrackAffordanceHoveredPillAxis } from 'utils/canvas/gridSlots/getGridTrackAffordanceHoveredPillAxis';
import { getGridTrackAffordancePillCenters } from 'utils/canvas/gridSlots/getGridTrackAffordancePillCenters';
import { getGridTrackAffordancePillOffset } from 'utils/canvas/gridSlots/getGridTrackAffordancePillOffset';
import { getGridTrackAffordanceZoneOffset } from 'utils/canvas/gridSlots/getGridTrackAffordanceZoneOffset';
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';
import { getUnrotatedQueryPoint } from '../../../../../utils/getUnrotatedQueryPoint';
import { isPointInGridTrackAffordanceHoverZone } from 'utils/canvas/gridSlots/isPointInGridTrackAffordanceHoverZone';

export const resolveGridTrackAffordanceHover = ({
  nodesById,
  point,
  refs,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const frame = getSelectedGridFrame(selectedNodes);

  if (frame) {
    const localPoint = getUnrotatedQueryPoint(point, frame, frame.rotation);
    const zoneOffset = getGridTrackAffordanceZoneOffset(viewport.zoom);
    const isInZone =
      localPoint.x >= frame.x - zoneOffset &&
      localPoint.x <= frame.x + frame.width &&
      localPoint.y >= frame.y - zoneOffset &&
      localPoint.y <= frame.y + frame.height;

    if (isInZone) {
      const layout = getGridTrackLayout(frame, nodesById);
      const framePoint: TPoint = { x: localPoint.x - frame.x, y: localPoint.y - frame.y };
      const cell = getGridDropCell(layout, framePoint);
      const pillOffset = getGridTrackAffordancePillOffset(viewport.zoom);
      const pillCenters = getGridTrackAffordancePillCenters(frame, layout, cell, pillOffset);
      const isOverColumnPill = isPointInGridTrackAffordanceHoverZone(localPoint, pillCenters.column, 'column', viewport.zoom);
      const isOverRowPill = isPointInGridTrackAffordanceHoverZone(localPoint, pillCenters.row, 'row', viewport.zoom);
      const hoveredPillAxis = getGridTrackAffordanceHoveredPillAxis(isOverColumnPill, isOverRowPill);
      let hoveredHandlePart: TGridTrackAffordanceHandlePart | null = null;

      if (hoveredPillAxis === 'column') {
        const columnTrack = buildGridTracks(layout.columnCount, frame.gridColumnSizes, DEFAULT_GRID_TRACK)[cell.column];

        hoveredHandlePart = getGridTrackAffordanceHoveredHandlePart(
          localPoint,
          pillCenters.column,
          columnTrack,
          layout.columnSizes[cell.column],
          viewport.zoom,
        );
      }

      if (hoveredPillAxis === 'row') {
        const rowTrack = buildGridTracks(layout.rowCount, frame.gridRowSizes, DEFAULT_GRID_TRACK)[cell.row] ?? DEFAULT_GRID_TRACK;

        hoveredHandlePart = getGridTrackAffordanceHoveredHandlePart(
          localPoint,
          pillCenters.row,
          rowTrack,
          layout.rowSizes[cell.row] ?? 0,
          viewport.zoom,
        );
      }

      refs.hover.hoveredGridTrackAffordanceRef.current = {
        columnIndex: cell.column,
        frameId: frame.id,
        hoveredHandlePart,
        hoveredPillAxis,
        rowIndex: cell.row,
      };

      return undefined;
    }
  }

  refs.hover.hoveredGridTrackAffordanceRef.current = null;
  return undefined;
};
