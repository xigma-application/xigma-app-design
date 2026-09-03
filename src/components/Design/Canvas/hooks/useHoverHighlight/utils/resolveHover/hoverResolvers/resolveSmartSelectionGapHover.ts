// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getSmartSelectionGapHandleAtPoint } from '../../../../../utils/getSmartSelectionGapHandleAtPoint';

export const resolveSmartSelectionGapHover = ({
  point,
  refs,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const hit = getSmartSelectionGapHandleAtPoint(point, selectedNodes, viewport);

  if (hit) {
    refs.hover.hoveredSmartSelectionGapRef.current = { axis: hit.axis, gapValue: hit.gapValue, point };
    return { className: hit.axis === 'x' ? 'move-x' : 'move-y', cursor: '', nodeId: null };
  }

  refs.hover.hoveredSmartSelectionGapRef.current = null;
};
