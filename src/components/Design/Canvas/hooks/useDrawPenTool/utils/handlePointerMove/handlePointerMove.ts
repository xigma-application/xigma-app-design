import { RefObject } from 'react';

// store
import { selectViewport } from 'store/design/selectors';
import { AppDispatch, AppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../types';
import { TPoint } from 'types/canvas';

// utils
import { continueVectorHandleDrag } from './continueVectorHandleDrag';
import { getPointerPosition } from '../../../../utils/getPointerPosition';
import { roundVectorPoint } from 'utils/canvas/vectorNetwork/roundVectorPoint';
import { screenToWorld } from '../../../../utils/screenToWorld';
import { updatePenPreview } from './updatePenPreview';

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
  vectorAlignmentGuideRef: TCanvasRefs['vectorAlignmentGuideRef'],
  setClassName: (className: string | null) => void,
): void => {
  const viewport = selectViewport(appStore.getState());
  const rawPoint = screenToWorld(getPointerPosition(canvas, event), viewport);
  const point: TPoint = roundVectorPoint(rawPoint);
  const isShiftPressed = event.shiftKey;

  if (dragOriginRef.current && dragStartRef.current) {
    continueVectorHandleDrag(
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
      vectorAlignmentGuideRef,
      hoveredSegmentIdRef,
      setClassName,
    );
  } else {
    updatePenPreview(
      point,
      viewport,
      isShiftPressed,
      appStore,
      penPreviewRef,
      penNewVertexPreviewRef,
      penDraggedHandlePositionRef,
      penDraggedHandleIsSnappedRef,
      pendingOutgoingTangentRef,
      hoveredSegmentIdRef,
      penHoveredDragArmableVertexRef,
      vectorAlignmentGuideRef,
      setClassName,
    );
  }
};
