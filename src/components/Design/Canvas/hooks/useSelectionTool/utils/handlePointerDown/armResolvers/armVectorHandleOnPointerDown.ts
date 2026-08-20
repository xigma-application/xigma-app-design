// others
import { VECTOR_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectPenActiveVertexId, selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { armVectorHandleDrag } from '../armVectorHandleDrag';
import { getOneHopVectorVertexIds } from 'utils/canvas/vectorNetwork/getOneHopVectorVertexIds';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVectorHandleAtPoint } from '../../../../../utils/getVectorHandleAtPoint';
import { getVisualSelectedVectorVertexIds } from 'utils/canvas/vectorNetwork/getVisualSelectedVectorVertexIds';
import { toggleVectorHandleSelection } from '../../toggleVectorHandleSelection';

export const armVectorHandleOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const state = store.getState();
  const node = getVectorEditingNode(state.design.nodes, selectVectorEditingNodeId(state));

  if (node) {
    const visualSelectedVertexIds = getVisualSelectedVectorVertexIds(
      canvasRefs.selectedVectorVertexIdsRef.current,
      selectPenActiveVertexId(state),
    );
    const visibleVertexIds = getOneHopVectorVertexIds(node, visualSelectedVertexIds);
    const hit = getVectorHandleAtPoint(
      point,
      node,
      VECTOR_HANDLE_HIT_RADIUS_PX / viewport.zoom,
      visibleVertexIds,
      canvasRefs.selectedVectorHandlesRef.current,
    );

    if (hit) {
      if (event.shiftKey) {
        canvasRefs.selectedVectorHandlesRef.current = toggleVectorHandleSelection(canvasRefs.selectedVectorHandlesRef.current, {
          end: hit.end,
          segmentId: hit.segmentId,
        });
      } else {
        canvasRefs.selectedVectorHandlesRef.current = [{ end: hit.end, segmentId: hit.segmentId }];
        canvasRefs.selectedVectorVertexIdsRef.current = [];
        armVectorHandleDrag(canvas, event, selectionRefs.vectorHandleDragRef, node.id, hit);
      }

      return true;
    }
  }
};
