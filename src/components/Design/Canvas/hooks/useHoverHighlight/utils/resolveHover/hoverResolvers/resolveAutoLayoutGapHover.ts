// others
import { SMART_SELECTION_GAP_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { getSelectedAutoLayoutFrame } from 'store/design/utils/autoLayout/getSelectedAutoLayoutFrame';

// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getAutoLayoutGapHandleAtPoint } from '../../../../../utils/getAutoLayoutGapHandleAtPoint';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getUnrotatedQueryPoint } from '../../../../../utils/getUnrotatedQueryPoint';

export const resolveAutoLayoutGapHover = ({
  nodesById,
  point,
  refs,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const frame = getSelectedAutoLayoutFrame(selectedNodes);

  if (!frame) {
    refs.hover.isAutoLayoutGapAreaHoveredRef.current = false;
    refs.hover.hoveredAutoLayoutGapRef.current = null;
    return undefined;
  }

  const localPoint = getUnrotatedQueryPoint(point, frame, frame.rotation);
  const isInsideFrame =
    localPoint.x >= frame.x && localPoint.x <= frame.x + frame.width && localPoint.y >= frame.y && localPoint.y <= frame.y + frame.height;

  refs.hover.isAutoLayoutGapAreaHoveredRef.current = isInsideFrame;

  if (!isInsideFrame) {
    refs.hover.hoveredAutoLayoutGapRef.current = null;
    return undefined;
  }

  const children = frame.childIds.map((childId) => nodesById[childId]).filter(Boolean);
  const tolerance = SMART_SELECTION_GAP_HANDLE_HIT_RADIUS_PX / viewport.zoom;
  const hit = getAutoLayoutGapHandleAtPoint(localPoint, frame, children, tolerance);

  if (hit) {
    refs.hover.hoveredAutoLayoutGapRef.current = { axis: hit.axis, frameId: frame.id, point };

    const cursorAngle = hit.axis === 'vertical' ? frame.rotation : frame.rotation + 90;

    return { className: null, cursor: getRotatedCursorUrl('gap', cursorAngle) ?? '', nodeId: null };
  }

  refs.hover.hoveredAutoLayoutGapRef.current = null;
  return undefined;
};
