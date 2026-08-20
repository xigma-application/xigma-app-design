// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

export const armVectorMarqueeOnPointerDown = ({ canvas, canvasRefs, event, hit, point, selectionRefs }: TArmContext): true | undefined => {
  const vectorEditingNodeId = selectVectorEditingNodeId(store.getState());

  if (vectorEditingNodeId && !hit && !event.shiftKey) {
    canvasRefs.selectedVectorVertexIdsRef.current = [];
    canvasRefs.selectedVectorHandlesRef.current = [];
    canvasRefs.selectedVectorSegmentIdsRef.current = [];
    selectionRefs.vectorMarqueeModeRef.current = null;
    selectionRefs.vectorMarqueeStartRef.current = point;
    canvas.setPointerCapture(event.pointerId);

    return true;
  }
};
