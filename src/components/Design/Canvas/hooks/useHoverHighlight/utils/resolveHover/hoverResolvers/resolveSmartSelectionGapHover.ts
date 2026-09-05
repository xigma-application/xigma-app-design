// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getSelectionBounds } from '../../../../../utils/getSelectionBounds';
import { getSmartSelectionGapHandleAtPoint } from '../../../../../utils/getSmartSelectionGapHandleAtPoint';
import { getSmartSelectionSwapHandleAtPoint } from '../../../../../utils/getSmartSelectionSwapHandleAtPoint';

const isPointInsideBounds = (point: THoverResolverContext['point'], bounds: ReturnType<typeof getSelectionBounds>): boolean =>
  point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height;

export const resolveSmartSelectionGapHover = ({
  nodesById,
  point,
  refs,
  smartSelectionNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getSmartSelectionGapHandleAtPoint(point, smartSelectionNodes, viewport, nodesById);
  const swapHit = getSmartSelectionSwapHandleAtPoint(point, smartSelectionNodes, viewport, nodesById);
  const hasSmartSelectionNodes = smartSelectionNodes.length > 0;
  const bounds = getSelectionBounds(smartSelectionNodes);

  refs.hover.isSmartSelectionBoxHoveredRef.current = hasSmartSelectionNodes && isPointInsideBounds(point, bounds);
  refs.hover.hoveredSmartSelectionSwapRef.current = swapHit ? { center: swapHit.center } : null;

  if (hit) {
    refs.hover.hoveredSmartSelectionGapRef.current = { axis: hit.axis, gapValue: hit.gapValue, point };
    return { className: hit.axis === 'x' ? 'move-x' : 'move-y', cursor: '', nodeId: null };
  }

  refs.hover.hoveredSmartSelectionGapRef.current = null;
};
