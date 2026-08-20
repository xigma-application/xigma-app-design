// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { commitVectorCornerHandleDrag } from '../../../../../utils/commitVectorCornerHandleDrag';
import { getVectorCornerHandleAtPoint } from '../../../../../utils/getVectorCornerHandleAtPoint';
import { getVectorCornerHandleDragCandidates } from '../../../../../utils/getVectorCornerHandleDragCandidates';
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
        const touchingSegments = Object.values(node.segments).filter(
          (segment) => segment.startId === hit.vertexId || segment.endId === hit.vertexId,
        );

        if (touchingSegments.length === 1) {
          const segment = touchingSegments[0];

          commitVectorCornerHandleDrag(
            node,
            hit.vertexId,
            { end: segment.endId === hit.vertexId ? 'end' : 'start', segmentId: segment.id },
            dispatch,
            canvasRefs,
            selectionRefs.vectorHandleDragRef,
          );
          canvas.setPointerCapture(event.pointerId);

          return true;
        }

        if (touchingSegments.length > 1) {
          selectionRefs.pendingVectorCornerHandleDragRef.current = {
            candidates: getVectorCornerHandleDragCandidates(touchingSegments, hit.vertexId, node),
            dragStart: point,
            nodeId: node.id,
            vertexId: hit.vertexId,
          };
          canvas.setPointerCapture(event.pointerId);

          return true;
        }
      }
    }
  }
};
