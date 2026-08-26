import { RefObject } from 'react';

// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TRotateDragState } from 'types/design/selectionTool/types';

// utils
import { commitRotatedVectorNodeSnapshots } from './commitRotatedVectorNodeSnapshots';

export const disarmRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  rotateDragRef: RefObject<TRotateDragState | null>,
  canvasRefs: TCanvasRefs,
): void => {
  const rotateDragState = rotateDragRef.current;

  if (rotateDragState) {
    commitRotatedVectorNodeSnapshots(dispatch, rotateDragState, canvasRefs);
    canvasRefs.rotatedNodeIdsRef.current = null;
    rotateDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
  }
};
