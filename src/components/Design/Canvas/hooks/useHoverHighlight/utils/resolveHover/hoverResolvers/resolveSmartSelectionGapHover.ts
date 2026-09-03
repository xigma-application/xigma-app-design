// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getSelectionBounds } from '../../../../../utils/getSelectionBounds';
import { getSmartSelectionGapHandleAtPoint } from '../../../../../utils/getSmartSelectionGapHandleAtPoint';
import { getSmartSelectionSwapHandleAtPoint } from '../../../../../utils/getSmartSelectionSwapHandleAtPoint';

const isPointInsideBounds = (point: THoverResolverContext['point'], bounds: ReturnType<typeof getSelectionBounds>): boolean =>
  point.x >= bounds.x && point.x <= bounds.x + bounds.width && point.y >= bounds.y && point.y <= bounds.y + bounds.height;

export const resolveSmartSelectionGapHover = ({
  point,
  refs,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getSmartSelectionGapHandleAtPoint(point, selectedNodes, viewport);

  refs.hover.isSmartSelectionBoxHoveredRef.current =
    selectedNodes.length > 0 && isPointInsideBounds(point, getSelectionBounds(selectedNodes));
  const swapHit = getSmartSelectionSwapHandleAtPoint(point, selectedNodes, viewport);
  refs.hover.hoveredSmartSelectionSwapRef.current = swapHit ? { center: swapHit.center } : null;

  if (hit) {
    refs.hover.hoveredSmartSelectionGapRef.current = { axis: hit.axis, gapValue: hit.gapValue, point };
    return { className: hit.axis === 'x' ? 'move-x' : 'move-y', cursor: '', nodeId: null };
  }

  refs.hover.hoveredSmartSelectionGapRef.current = null;
};
