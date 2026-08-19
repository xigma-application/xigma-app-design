import { RefObject } from 'react';

// store
import { selectPenActiveVertexId, selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../types';
import { TPoint } from 'types/canvas';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { updateVectorHandleDrag } from './updateVectorHandleDrag';
import { updateVectorPenPreview } from './updateVectorPenPreview';

export const handlePointerMove = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  dragOriginRef: RefObject<TPenDragOrigin | null>,
  dragStartRef: RefObject<TPoint | null>,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  penPreviewRef: TCanvasRefs['penPreviewRef'],
  penNewVertexPreviewRef: TCanvasRefs['penNewVertexPreviewRef'],
): void => {
  const state = appStore.getState();
  const viewport = selectViewport(state);
  const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
  const point: TPoint = { x: Math.round(rawPoint.x), y: Math.round(rawPoint.y) };

  if (dragOriginRef.current && dragStartRef.current) {
    updateVectorHandleDrag(point, dragOriginRef.current, dragStartRef.current, viewport, dispatch, appStore, pendingOutgoingTangentRef);
  } else {
    const vectorEditingNodeId = selectVectorEditingNodeId(state);
    const node = getVectorEditingNode(state.design.nodes, vectorEditingNodeId);

    if (node) {
      const penActiveVertexId = selectPenActiveVertexId(state);
      updateVectorPenPreview(point, node, penActiveVertexId, viewport, penPreviewRef, pendingOutgoingTangentRef);
      penNewVertexPreviewRef.current = null;
    } else {
      penPreviewRef.current = null;
      penNewVertexPreviewRef.current = point;
    }
  }
};
