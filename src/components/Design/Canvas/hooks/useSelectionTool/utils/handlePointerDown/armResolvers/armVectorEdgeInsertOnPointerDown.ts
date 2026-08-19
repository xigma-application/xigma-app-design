import { nanoid } from '@reduxjs/toolkit';

// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { updateNode } from 'store/design/slice';
import { selectVectorEditingNodeId } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../types';

// utils
import { getVectorEdgeAtPoint } from '../../../../../utils/getVectorEdgeAtPoint';
import { getVectorEditingNode } from '../../../../../utils/getVectorEditingNode';

export const armVectorEdgeInsertOnPointerDown = ({ dispatch, point, viewport }: TArmContext): true | undefined => {
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
      const newVertexId = nanoid();
      const newSegmentId = nanoid();

      dispatch(
        updateNode({
          changes: {
            segments: {
              ...node.segments,
              [hit.segmentId]: {
                endId: newVertexId,
                id: hit.segmentId,
                startId: segment.startId,
                tangentEnd: null,
                tangentStart: segment.tangentStart,
              },
              [newSegmentId]: {
                endId: segment.endId,
                id: newSegmentId,
                startId: newVertexId,
                tangentEnd: segment.tangentEnd,
                tangentStart: null,
              },
            },
            vertices: { ...node.vertices, [newVertexId]: { id: newVertexId, x: Math.round(point.x), y: Math.round(point.y) } },
          },
          id: node.id,
        }),
      );

      return true;
    }
  }
};
