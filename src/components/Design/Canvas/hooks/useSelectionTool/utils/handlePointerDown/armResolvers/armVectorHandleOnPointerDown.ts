// others
import { VECTOR_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorHandleDrag } from '../armVectorHandleDrag';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVectorHandleAtPoint } from '../../../../../utils/getVectorHandleAtPoint';

export const armVectorHandleOnPointerDown = ({ canvas, event, point, selectionRefs, viewport }: TArmContext): true | undefined => {
  const node = getVectorEditingNode(store.getState().design.nodes, selectVectorEditingNodeId(store.getState()));

  if (node) {
    const hit = getVectorHandleAtPoint(point, node, VECTOR_HANDLE_HIT_RADIUS_PX / viewport.zoom);

    if (hit) {
      armVectorHandleDrag(canvas, event, selectionRefs.vectorHandleDragRef, node.id, hit);

      return true;
    }
  }
};
