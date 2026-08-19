import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TVectorHandleDragState } from 'types/design/selectionTool/types';
import { TVectorTangent } from 'types/design/types';

// utils
import { getMirroredVectorSegments } from '../../../../utils/getMirroredVectorSegments';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { screenToWorld } from '../../../../utils/screenToWorld';

export const continueVectorHandleDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  vectorHandleDragRef: RefObject<TVectorHandleDragState | null>,
): void => {
  const dragState = vectorHandleDragRef.current;

  if (dragState) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.nodes, dragState.nodeId);

    if (node) {
      const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
      const vertex = node.vertices[dragState.vertexId];
      const tangent: TVectorTangent = { x: Math.round(point.x - vertex.x), y: Math.round(point.y - vertex.y) };
      const field = dragState.end === 'start' ? 'tangentStart' : 'tangentEnd';
      const mode = node.vertexHandleModes[dragState.vertexId] ?? 'corner';
      const segments = getMirroredVectorSegments(node.segments, dragState.vertexId, mode, dragState.segmentId, field, tangent);

      dispatch(updateNode({ changes: { segments }, id: dragState.nodeId }));
    }
  }
};
