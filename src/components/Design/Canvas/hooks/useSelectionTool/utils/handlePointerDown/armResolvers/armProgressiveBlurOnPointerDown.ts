// store
import { selectOpenPropertyPanel } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armProgressiveBlurDrag } from '../armProgressiveBlurDrag';
import { getProgressiveBlurHandleAtPoint } from '../../../../../utils/getProgressiveBlurHandleAtPoint';

export const armProgressiveBlurOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectedNodes,
  viewport,
}: TArmContext): true | undefined => {
  const hit = getProgressiveBlurHandleAtPoint(point, selectedNodes, viewport, selectOpenPropertyPanel(store.getState()));

  if (hit) {
    armProgressiveBlurDrag(canvas, event, canvasRefs.progressiveBlur.dragRef, hit);
    return true;
  }
};
