// others
import { VECTOR_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectPenActiveVertexId, selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../../types';

// utils
import { armVectorHandleClick } from './armVectorHandleClick';
import { getOneHopVectorVertexIds } from 'utils/canvas/vectorNetwork/getOneHopVectorVertexIds';
import { getVectorEditingNode } from '../../../../../../utils/getVectorEditingNode';
import { getVectorHandleAtPoint } from '../../../../../../utils/getVectorHandleAtPoint';
import { getVisualSelectedVectorVertexIds } from 'utils/canvas/vectorNetwork/getVisualSelectedVectorVertexIds';

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
    const oneHopVertexIds = getOneHopVectorVertexIds(node, visualSelectedVertexIds);
    const hit = getVectorHandleAtPoint(
      point,
      node,
      VECTOR_HANDLE_HIT_RADIUS_PX / viewport.zoom,
      visualSelectedVertexIds,
      oneHopVertexIds,
      canvasRefs.selectedVectorHandlesRef.current,
      canvasRefs.selectedVectorSegmentIdsRef.current,
    );

    if (hit) {
      armVectorHandleClick(canvas, event, canvasRefs, selectionRefs, node, hit, point);

      return true;
    }
  }
};
