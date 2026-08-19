// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorHandleDrag } from '../armVectorHandleDrag';
import { getVectorCornerHandleAtPoint } from '../../../../../utils/getVectorCornerHandleAtPoint';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';

export const armVectorCornerHandleOnPointerDown = ({
  canvas,
  dispatch,
  event,
  point,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  if (event.ctrlKey || event.metaKey) {
    const node = getVectorEditingNode(store.getState().design.nodes, selectVectorEditingNodeId(store.getState()));

    if (node) {
      const hit = getVectorCornerHandleAtPoint(point, node, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);

      if (hit) {
        dispatch(updateNode({ changes: { vertexHandleModes: { ...node.vertexHandleModes, [hit.vertexId]: 'smooth' } }, id: node.id }));
        armVectorHandleDrag(canvas, event, selectionRefs.vectorHandleDragRef, node.id, hit);

        return true;
      }
    }
  }
};
