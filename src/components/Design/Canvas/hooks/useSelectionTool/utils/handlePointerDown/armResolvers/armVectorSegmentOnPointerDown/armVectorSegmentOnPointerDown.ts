// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../../types';

// utils
import { armVectorSegmentClick } from './armVectorSegmentClick';
import { getVectorEditingNode } from '../../../../../../utils/getVectorEditingNode';
import { getVectorEdgeAtPoint } from '../../../../../../utils/getVectorEdgeAtPoint';
import { getVectorSegmentMidpointAtPoint } from 'utils/canvas/vectorNetwork/getVectorSegmentMidpointAtPoint';

export const armVectorSegmentOnPointerDown = ({
  canvas,
  canvasRefs,
  event,
  point,
  selectionRefs,
  viewport,
}: TArmContext): true | undefined => {
  const node = getVectorEditingNode(store.getState().design.nodes, selectVectorEditingNodeId(store.getState()));

  if (node) {
    const hit = getVectorEdgeAtPoint(
      point,
      node,
      VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
      VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
    );

    if (hit) {
      const midpointHit = getVectorSegmentMidpointAtPoint(point, node, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);
      const canSplit = midpointHit?.segmentId === hit.segmentId;

      armVectorSegmentClick(canvas, event, canvasRefs, selectionRefs, node, hit.segmentId, canSplit, point);

      return true;
    }
  }
};
