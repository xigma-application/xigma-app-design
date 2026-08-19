import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { TVectorVertexDragState } from 'types/design/selectionTool/types';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { translateVectorVertices } from '../../../../utils/translateVectorVertices';

export const continueVectorVertexDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  vectorVertexDragRef: RefObject<TVectorVertexDragState | null>,
): void => {
  const dragState = vectorVertexDragRef.current;

  if (dragState) {
    const state = store.getState();
    const node = getVectorEditingNode(state.design.nodes, dragState.nodeId);

    if (node) {
      const point = screenToWorld(getPointerPosition(canvas, event), selectViewport(state));
      const deltaX = point.x - dragState.pointerStart.x;
      const deltaY = point.y - dragState.pointerStart.y;
      const draggedVertices = translateVectorVertices(dragState.origins, deltaX, deltaY);

      dispatch(updateNode({ changes: { vertices: { ...node.vertices, ...draggedVertices } }, id: dragState.nodeId }));
    }
  }
};
