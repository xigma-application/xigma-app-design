// others
import { AUTO_LAYOUT_PADDING_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { getSelectedAutoLayoutFrame } from 'store/design/utils/autoLayout/getSelectedAutoLayoutFrame';

// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getAutoLayoutPaddingCursorAngle } from 'utils/canvas/autoLayoutPadding/getAutoLayoutPaddingCursorAngle';
import { getAutoLayoutPaddingHandleAtPoint } from '../../../../../utils/getAutoLayoutPaddingHandleAtPoint';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getUnrotatedQueryPoint } from '../../../../../utils/getUnrotatedQueryPoint';

export const resolveAutoLayoutPaddingHover = ({
  point,
  refs,
  selectedNodes,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  const frame = getSelectedAutoLayoutFrame(selectedNodes);

  if (!frame) {
    refs.hover.isAutoLayoutPaddingAreaHoveredRef.current = false;
    refs.hover.hoveredAutoLayoutPaddingRef.current = null;
    return undefined;
  }

  const localPoint = getUnrotatedQueryPoint(point, frame, frame.rotation);
  const isInsideFrame =
    localPoint.x >= frame.x && localPoint.x <= frame.x + frame.width && localPoint.y >= frame.y && localPoint.y <= frame.y + frame.height;

  refs.hover.isAutoLayoutPaddingAreaHoveredRef.current = isInsideFrame;

  const tolerance = AUTO_LAYOUT_PADDING_HANDLE_HIT_RADIUS_PX / viewport.zoom;
  const hit = getAutoLayoutPaddingHandleAtPoint(localPoint, frame, viewport, tolerance);

  if (hit) {
    refs.hover.hoveredAutoLayoutPaddingRef.current = { frameId: frame.id, point, side: hit.side };

    const cursorAngle = getAutoLayoutPaddingCursorAngle(hit.side, frame.rotation, hit.value === 0);
    const cursorKind = hit.value === 0 ? 'padding' : 'gap';

    return { className: null, cursor: getRotatedCursorUrl(cursorKind, cursorAngle) ?? '', nodeId: null };
  }

  refs.hover.hoveredAutoLayoutPaddingRef.current = null;
  return undefined;
};
