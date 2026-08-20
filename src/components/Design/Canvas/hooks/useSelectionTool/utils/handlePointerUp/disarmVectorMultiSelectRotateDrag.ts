import { RefObject } from 'react';

// types
import { TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';

export const disarmVectorMultiSelectRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorMultiSelectRotateDragRef: RefObject<TVectorMultiSelectRotateDragState | null>,
  vectorMultiSelectBoxRef: RefObject<TVectorMultiSelectBox | null>,
): void => {
  const dragState = vectorMultiSelectRotateDragRef.current;

  if (dragState) {
    const box = vectorMultiSelectBoxRef.current;

    if (box) {
      vectorMultiSelectBoxRef.current = { ...box, rotation: dragState.rotation + dragState.deltaDegrees };
    }

    vectorMultiSelectRotateDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = '';
  }
};
