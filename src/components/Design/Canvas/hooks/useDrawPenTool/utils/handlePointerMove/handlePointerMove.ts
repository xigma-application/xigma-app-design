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
import { updateNewVertexPreview } from './updateNewVertexPreview';
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
  setClassName: (className: string | null) => void,
): void => {
  const state = appStore.getState();
  const viewport = selectViewport(state);
  const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
  const point: TPoint = { x: Math.round(rawPoint.x), y: Math.round(rawPoint.y) };

  if (dragOriginRef.current && dragStartRef.current) {
    updateVectorHandleDrag(point, dragOriginRef.current, dragStartRef.current, viewport, dispatch, appStore, pendingOutgoingTangentRef);
    setClassName('pen');
  } else {
    const vectorEditingNodeId = selectVectorEditingNodeId(state);
    const node = getVectorEditingNode(state.design.nodes, vectorEditingNodeId);
    const penActiveVertexId = selectPenActiveVertexId(state);

    if (node && penActiveVertexId) {
      const isSnapped = updateVectorPenPreview(point, node, penActiveVertexId, viewport, penPreviewRef, pendingOutgoingTangentRef);

      penNewVertexPreviewRef.current = null;
      setClassName(isSnapped ? 'pen-snap' : 'pen');
    } else {
      const isSnapped = updateNewVertexPreview(point, node, viewport, penNewVertexPreviewRef);

      penPreviewRef.current = null;
      setClassName(isSnapped ? 'pen-snap' : 'pen');
    }
  }
};
