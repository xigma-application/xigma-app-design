// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { store } from 'store';

// types
import { TArmContext } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { getVectorEdgeAtPoint } from '../../../../../utils/getVectorEdgeAtPoint';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';

const getStraightTangent = (from: TPoint, to: TPoint): TPoint => ({ x: (to.x - from.x) / 3, y: (to.y - from.y) / 3 });

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
      const hit = getVectorEdgeAtPoint(
        point,
        node,
        VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
        VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
      );

      if (hit) {
        const segment = node.segments[hit.segmentId];
        const start = node.vertices[segment.startId];
        const end = node.vertices[segment.endId];
        const tangentStart = segment.tangentStart ?? getStraightTangent(start, end);
        const tangentEnd = segment.tangentEnd ?? getStraightTangent(end, start);
        const segments = { ...node.segments, [hit.segmentId]: { ...segment, tangentEnd, tangentStart } };
        const vertexHandleModes = {
          ...node.vertexHandleModes,
          [segment.endId]: 'symmetric' as const,
          [segment.startId]: 'symmetric' as const,
        };

        dispatch(updateNode({ changes: { segments, vertexHandleModes }, id: node.id }));

        canvasRefs.selectedVectorSegmentIdsRef.current = [hit.segmentId];
        canvasRefs.selectedVectorVertexIdsRef.current = [];
        canvasRefs.selectedVectorHandlesRef.current = [];
        selectionRefs.vectorSegmentBendDragRef.current = {
          dragStart: point,
          nodeId: node.id,
          originalTangentEnd: segment.tangentEnd,
          originalTangentStart: segment.tangentStart,
          segmentId: hit.segmentId,
          tangentEnd,
          tangentStart,
        };
        canvas.setPointerCapture(event.pointerId);

        return true;
      }
    }
  }
};
