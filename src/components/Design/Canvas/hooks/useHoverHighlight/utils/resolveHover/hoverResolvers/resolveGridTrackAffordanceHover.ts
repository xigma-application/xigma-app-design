// store
import { getSelectedGridFrame } from 'store/design/utils/autoLayout/getSelectedGridFrame';

// types
import { THoverResolverContext, THoverResult } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { getGridDropCell } from 'utils/canvas/gridSlots/getGridDropCell';
import { getGridTrackAffordanceZoneOffset } from 'utils/canvas/gridSlots/getGridTrackAffordanceZoneOffset';
import { getGridTrackLayout } from 'utils/canvas/gridSlots/getGridTrackLayout';
import { getUnrotatedQueryPoint } from '../../../../../utils/getUnrotatedQueryPoint';

export const resolveGridTrackAffordanceHover = ({
  nodesById,
  point,
  refs,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const frame = getSelectedGridFrame(selectedNodes);

  if (!frame) {
    refs.hover.hoveredGridTrackAffordanceRef.current = null;
    return undefined;
  }

  const localPoint = getUnrotatedQueryPoint(point, frame, frame.rotation);
  const offset = getGridTrackAffordanceZoneOffset(viewport.zoom);
  const isInZone =
    localPoint.x >= frame.x - offset &&
    localPoint.x <= frame.x + frame.width &&
    localPoint.y >= frame.y - offset &&
    localPoint.y <= frame.y + frame.height;

  if (!isInZone) {
    refs.hover.hoveredGridTrackAffordanceRef.current = null;
    return undefined;
  }

  const layout = getGridTrackLayout(frame, nodesById);
  const framePoint: TPoint = { x: localPoint.x - frame.x, y: localPoint.y - frame.y };
  const cell = getGridDropCell(layout, framePoint);

  refs.hover.hoveredGridTrackAffordanceRef.current = { columnIndex: cell.column, frameId: frame.id, rowIndex: cell.row };

  return undefined;
};
