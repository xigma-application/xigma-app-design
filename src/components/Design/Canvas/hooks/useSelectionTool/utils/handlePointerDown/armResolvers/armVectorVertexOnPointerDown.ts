// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorVertexDrag } from '../armVectorVertexDrag';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVectorVertexAtPoint } from '../../../../../utils/getVectorVertexAtPoint';

export const armVectorVertexOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const node = getVectorEditingNode(store.getState().design.nodes, selectVectorEditingNodeId(store.getState()));

  if (node) {
    const hit = getVectorVertexAtPoint(point, node, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);

    if (hit) {
      canvasRefs.selectedVectorVertexIdsRef.current = [hit.vertexId];
      armVectorVertexDrag(canvas, event, selectionRefs.vectorVertexDragRef, node, hit.vertexId, point);

      return true;
    }
  }
};
