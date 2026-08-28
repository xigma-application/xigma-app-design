// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

export const armVectorMarqueeOnPointerDown = ({ canvas, canvasRefs, event, hit, point, selectionRefs }: TArmContext): true | undefined => {
  const vectorEditingNodeIds = selectVectorEditingNodeIds(store.getState());

  if (vectorEditingNodeIds.length > 0 && !hit && !event.shiftKey) {
    canvasRefs.vectorEdit.preVectorMarqueeVertexIdsRef.current = canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current;
    canvasRefs.vectorEdit.preVectorMarqueeSegmentIdsRef.current = canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current;
    canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = [];
    canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [];
    canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = [];
    selectionRefs.vectorMarqueeModeRef.current = null;
    selectionRefs.vectorMarqueeStartRef.current = point;
    canvas.setPointerCapture(event.pointerId);

    return true;
  }
};
