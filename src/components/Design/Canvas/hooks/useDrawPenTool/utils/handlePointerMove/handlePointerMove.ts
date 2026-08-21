import { RefObject } from 'react';

// store
import { selectPenActiveVertexId, selectVectorEditingNodeId, selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../types';
import { TPenPointHoverKind } from './resolvePenPointHover/types';
import { TPoint } from 'types/canvas';

// utils
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { getVectorEditingNode } from '../../../../utils/getVectorEditingNode';
import { roundVectorPoint } from 'utils/canvas/vectorNetwork/roundVectorPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { updateNewVertexPreview } from './updateNewVertexPreview';
import { updateVectorHandleDrag } from './updateVectorHandleDrag';
import { updateVectorPenPreview } from './updateVectorPenPreview';

const getPenHoverCursorClassName = (hoverKind: TPenPointHoverKind | null): string => {
  switch (hoverKind) {
    case 'active-vertex':
    case 'vertex':
    case 'edge-snap':
      return 'pen-snap';
    case 'edge':
      return 'pen-extend';
    default:
      return 'pen';
  }
};

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
  penDraggedHandlePositionRef: TCanvasRefs['penDraggedHandlePositionRef'],
  penDraggedHandleIsSnappedRef: TCanvasRefs['penDraggedHandleIsSnappedRef'],
  hoveredSegmentIdRef: TCanvasRefs['hoveredSegmentIdRef'],
  penHoveredDragArmableVertexRef: TCanvasRefs['penHoveredDragArmableVertexRef'],
  setClassName: (className: string | null) => void,
): void => {
  const state = appStore.getState();
  const viewport = selectViewport(state);
  const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
  const point: TPoint = roundVectorPoint(rawPoint);
  const isShiftPressed = event.shiftKey;

  if (dragOriginRef.current && dragStartRef.current) {
    updateVectorHandleDrag(
      point,
      dragOriginRef.current,
      dragStartRef.current,
      viewport,
      isShiftPressed,
      dispatch,
      appStore,
      pendingOutgoingTangentRef,
      penDraggedHandlePositionRef,
      penDraggedHandleIsSnappedRef,
    );
    hoveredSegmentIdRef.current = null;
    setClassName('pen');
  } else {
    const vectorEditingNodeId = selectVectorEditingNodeId(state);
    const node = getVectorEditingNode(state.design.nodes, vectorEditingNodeId);
    const penActiveVertexId = selectPenActiveVertexId(state);

    penDraggedHandlePositionRef.current = null;
    penDraggedHandleIsSnappedRef.current = false;

    if (node && penActiveVertexId) {
      const hoverKind = updateVectorPenPreview(
        point,
        node,
        penActiveVertexId,
        viewport,
        isShiftPressed,
        penPreviewRef,
        pendingOutgoingTangentRef,
        hoveredSegmentIdRef,
        penHoveredDragArmableVertexRef,
      );

      penNewVertexPreviewRef.current = null;
      setClassName(getPenHoverCursorClassName(hoverKind));
    } else {
      const hoverKind = updateNewVertexPreview(
        point,
        node,
        viewport,
        penNewVertexPreviewRef,
        hoveredSegmentIdRef,
        penHoveredDragArmableVertexRef,
      );

      penPreviewRef.current = null;
      setClassName(getPenHoverCursorClassName(hoverKind));
    }
  }
};
