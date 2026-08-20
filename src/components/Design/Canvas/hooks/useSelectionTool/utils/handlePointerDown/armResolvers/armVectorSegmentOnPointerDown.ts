// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';
import { getVectorEdgeAtPoint } from '../../../../../utils/getVectorEdgeAtPoint';

export const armVectorSegmentOnPointerDown = ({ canvasRefs, point, viewport }: TArmContext): true | undefined => {
  const node = getVectorEditingNode(store.getState().design.nodes, selectVectorEditingNodeId(store.getState()));

  if (node) {
    const hit = getVectorEdgeAtPoint(
      point,
      node,
      VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
      VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
    );

    if (hit) {
      canvasRefs.selectedVectorSegmentIdsRef.current = [hit.segmentId];
      canvasRefs.selectedVectorVertexIdsRef.current = [];
      canvasRefs.selectedVectorHandlesRef.current = [];

      return true;
    }
  }
};
