// store
import { getSelectedGridFrame } from 'store/design/utils/autoLayout/getSelectedGridFrame';

// types
import { THoverResolverContext, THoverResult } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { getGridDropCell } from 'utils/canvas/gridSlots/getGridDropCell';
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

      refs.hover.hoveredGridTrackAffordanceRef.current = {
        columnIndex: cell.column,
        frameId: frame.id,
        hoveredPillAxis: getGridTrackAffordanceHoveredPillAxis(isOverColumnPill, isOverRowPill),
        rowIndex: cell.row,
      };

      return undefined;
    }
  }

  refs.hover.hoveredGridTrackAffordanceRef.current = null;
  return undefined;
};
