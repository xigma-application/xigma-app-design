// types
import { TArmContext } from '../types';

// utils
import { armMarqueeDrag } from '../armMarqueeDrag';

export const armMarqueeOnPointerDown = ({ canvas, dispatch, event, point, selectionRefs }: TArmContext): true | undefined => {
  if (!event.shiftKey) {
    armMarqueeDrag(canvas, event, dispatch, selectionRefs.marqueeStartRef, point);

    return true;
  }
};
