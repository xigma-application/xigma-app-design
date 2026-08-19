// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

export const armVectorEditMissOnPointerDown = ({ canvasRefs, hit }: TArmContext): true | undefined => {
  const vectorEditingNodeId = selectVectorEditingNodeId(store.getState());

  if (vectorEditingNodeId && !hit) {
    canvasRefs.selectedVectorVertexIdsRef.current = [];
    canvasRefs.selectedVectorHandleRef.current = null;

    return true;
  }
};
