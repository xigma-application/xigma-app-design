// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { commitVectorBendSegment } from '../../../../../utils/commitVectorBendSegment';
import { getAllVectorEdgeMatchesAtPoint } from '../../../../../utils/getVectorEdgeAtPoint';
import { getVectorBendDragCandidates } from '../../../../../utils/getVectorBendDragCandidates';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';

export const armVectorBendSegmentOnPointerDown = ({
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
      const matches = getAllVectorEdgeMatchesAtPoint(
        point,
        node,
        VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
        VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
      );

      if (matches.length === 1) {
        commitVectorBendSegment(node, matches[0].segmentId, point, dispatch, canvasRefs, selectionRefs.vectorSegmentBendDragRef);
        canvas.setPointerCapture(event.pointerId);

        return true;
      }

      if (matches.length > 1) {
        selectionRefs.vectorSegmentBendDragRef.current = {
          candidates: getVectorBendDragCandidates(matches, node, point),
          dragStart: point,
          nodeId: node.id,
          status: 'pending',
        };
        canvas.setPointerCapture(event.pointerId);

        return true;
      }
    }
  }
};
