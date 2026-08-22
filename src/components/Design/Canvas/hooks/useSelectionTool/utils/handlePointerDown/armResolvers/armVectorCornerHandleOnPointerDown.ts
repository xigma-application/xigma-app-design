// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { commitVectorCornerHandleDrag } from '../../../../../utils/commitVectorCornerHandleDrag';
import { getVectorCornerHandleAtPointAcrossOpenNodes } from '../../../../../utils/getVectorCornerHandleAtPointAcrossOpenNodes';
import { getVectorCornerHandleDragCandidates } from '../../../../../utils/getVectorCornerHandleDragCandidates';

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
    const state = store.getState();
    const result = getVectorCornerHandleAtPointAcrossOpenNodes(
      point,
      selectVectorEditingNodeIds(state),
      state.design.nodes,
      VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
    );

    if (result) {
      const { node, vertexId } = result;
      const touchingSegments = Object.values(node.segments).filter((segment) => segment.startId === vertexId || segment.endId === vertexId);

      if (touchingSegments.length === 1) {
        const segment = touchingSegments[0];

        commitVectorCornerHandleDrag(
          node,
          vertexId,
          { end: segment.endId === vertexId ? 'end' : 'start', segmentId: segment.id },
          dispatch,
          canvasRefs,
          selectionRefs.vectorHandleDragRef,
        );
        canvas.setPointerCapture(event.pointerId);

        return true;
      }

      if (touchingSegments.length > 1) {
        selectionRefs.pendingVectorCornerHandleDragRef.current = {
          candidates: getVectorCornerHandleDragCandidates(touchingSegments, vertexId, node),
          dragStart: point,
          nodeId: node.id,
          vertexId,
        };
        canvas.setPointerCapture(event.pointerId);

        return true;
      }
    }
  }
};
