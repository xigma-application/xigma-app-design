// others
import { SMART_SELECTION_GAP_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectNodes } from 'store/design/selectors';
import { getSelectedAutoLayoutFrame } from 'store/design/utils/autoLayout/getSelectedAutoLayoutFrame';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armAutoLayoutGapDrag } from '../armAutoLayoutGapDrag';
import { getAutoLayoutGapHandleAtPoint } from '../../../../../utils/getAutoLayoutGapHandleAtPoint';
import { getUnrotatedQueryPoint } from '../../../../../utils/getUnrotatedQueryPoint';

export const armAutoLayoutGapOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const frame = getSelectedAutoLayoutFrame(selectedNodes);

  if (frame) {
    const nodesById = selectNodes(store.getState());
    const children = frame.childIds.map((childId) => nodesById[childId]).filter(Boolean);
    const localPoint = getUnrotatedQueryPoint(point, frame, frame.rotation);
    const tolerance = SMART_SELECTION_GAP_HANDLE_HIT_RADIUS_PX / viewport.zoom;
    const hit = getAutoLayoutGapHandleAtPoint(localPoint, frame, children, tolerance);

    if (hit) {
      const originalGapValue = hit.axis === 'horizontal' ? (frame.horizontalGap ?? 0) : (frame.verticalGap ?? 0);

      armAutoLayoutGapDrag(canvas, event, canvasRefs.transform.autoLayoutGapDragRef, hit.axis, frame.id, originalGapValue, point);
      return true;
    }
  }
};
