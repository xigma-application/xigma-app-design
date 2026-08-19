import { nanoid } from '@reduxjs/toolkit';
import { RefObject } from 'react';

// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { endHistoryGesture } from 'store/history/actions';
import { setPenActiveVertexId, updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPenDragOrigin } from '../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { getVectorVertexAtPoint } from '../../../../utils/getVectorVertexAtPoint';

export const startVectorFragment = (
  point: TPoint,
  node: TVectorNode,
  viewport: TViewport,
  dispatch: AppDispatch,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
): void => {
  const hover = getVectorVertexAtPoint(point, node, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);

  if (hover) {
    dispatch(setPenActiveVertexId(hover.vertexId));
    dispatch(endHistoryGesture());
  } else {
    const vertexId = nanoid();
    const vertices = { ...node.vertices, [vertexId]: { id: vertexId, x: point.x, y: point.y } };

    dispatch(updateNode({ changes: { vertices }, id: node.id }));
    dispatch(setPenActiveVertexId(vertexId));

    dragOriginRef.current = { nodeId: node.id, segmentId: null, vertexId };
    dragStartRef.current = point;
  }
};
