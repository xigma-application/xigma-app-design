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
  canvasRefs,
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
        dispatch(updateNode({ changes: { vertexHandleModes: { ...node.vertexHandleModes, [hit.vertexId]: 'symmetric' } }, id: node.id }));
        canvasRefs.selectedVectorHandlesRef.current = [{ end: hit.end, segmentId: hit.segmentId }];
        canvasRefs.selectedVectorVertexIdsRef.current = [];
        canvasRefs.selectedVectorSegmentIdsRef.current = [];
        armVectorHandleDrag(canvas, event, selectionRefs.vectorHandleDragRef, node.id, hit);

        return true;
      }
    }
  }
};
