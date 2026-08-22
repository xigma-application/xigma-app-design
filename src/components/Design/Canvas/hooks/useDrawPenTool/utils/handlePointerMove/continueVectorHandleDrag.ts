import { RefObject } from 'react';

// store
import { AppDispatch, AppStore } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../types';
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { updateVectorHandleDrag } from './updateVectorHandleDrag';

export const continueVectorHandleDrag = (
  point: TPoint,
  dragOrigin: TPenDragOrigin,
  dragStart: TPoint,
  viewport: TViewport,
  isShiftPressed: boolean,
  dispatch: AppDispatch,
  appStore: AppStore,
  pendingOutgoingTangentRef: RefObject<TPendingOutgoingTangent | null>,
  penDraggedHandlePositionRef: TCanvasRefs['penDraggedHandlePositionRef'],
  penDraggedHandleIsSnappedRef: TCanvasRefs['penDraggedHandleIsSnappedRef'],
  vectorAlignmentGuideRef: TCanvasRefs['vectorAlignmentGuideRef'],
  hoveredSegmentIdRef: TCanvasRefs['hoveredSegmentIdRef'],
  setClassName: (className: string | null) => void,
): void => {
  updateVectorHandleDrag(
    point,
    dragOrigin,
    dragStart,
    viewport,
    isShiftPressed,
    dispatch,
    appStore,
    pendingOutgoingTangentRef,
    penDraggedHandlePositionRef,
    penDraggedHandleIsSnappedRef,
    vectorAlignmentGuideRef,
  );
  hoveredSegmentIdRef.current = null;
  setClassName('pen');
};
