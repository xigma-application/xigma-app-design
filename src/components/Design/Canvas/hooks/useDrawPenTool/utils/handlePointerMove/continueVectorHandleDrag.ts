import { RefObject } from 'react';

// store
import { AppDispatch, AppStore } from 'store';

// types
import { THoverRefs, TPenRefs, TVectorEditRefs } from 'types/design/canvas/types';
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
  penDraggedHandlePositionRef: TPenRefs['penDraggedHandlePositionRef'],
  penDraggedHandleIsSnappedRef: TPenRefs['penDraggedHandleIsSnappedRef'],
  vectorAlignmentGuideRef: TVectorEditRefs['vectorAlignmentGuideRef'],
  hoveredSegmentIdRef: THoverRefs['hoveredSegmentIdRef'],
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
