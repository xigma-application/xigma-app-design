// others
import { AUTO_LAYOUT_PADDING_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { getSelectedAutoLayoutFrame } from 'store/design/utils/autoLayout/getSelectedAutoLayoutFrame';

// types
import { TArmContext } from '../types';

// utils
import { armAutoLayoutPaddingDrag } from '../armAutoLayoutPaddingDrag';
import { getAutoLayoutPaddingHandleAtPoint } from '../../../../../utils/getAutoLayoutPaddingHandleAtPoint';
import { getUnrotatedQueryPoint } from '../../../../../utils/getUnrotatedQueryPoint';

export const armAutoLayoutPaddingOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const frame = getSelectedAutoLayoutFrame(selectedNodes);

  if (frame) {
    const localPoint = getUnrotatedQueryPoint(point, frame, frame.rotation);
    const tolerance = AUTO_LAYOUT_PADDING_HANDLE_HIT_RADIUS_PX / viewport.zoom;
    const hit = getAutoLayoutPaddingHandleAtPoint(localPoint, frame, viewport, tolerance);

    if (hit) {
      armAutoLayoutPaddingDrag(canvas, event, canvasRefs.transform.autoLayoutPaddingDragRef, hit.side, frame.id, hit.value, point);
      return true;
    }
  }
};
