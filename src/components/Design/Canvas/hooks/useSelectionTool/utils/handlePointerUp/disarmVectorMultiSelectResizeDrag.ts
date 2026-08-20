import { RefObject } from 'react';

// types
import { TVectorMultiSelectBox } from 'types/design/canvas/types';
import { TVectorMultiSelectResizeDragState } from 'types/design/selectionTool/types';

export const disarmVectorMultiSelectResizeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  vectorMultiSelectResizeDragRef: RefObject<TVectorMultiSelectResizeDragState | null>,
  vectorMultiSelectBoxRef: RefObject<TVectorMultiSelectBox | null>,
): void => {
  const dragState = vectorMultiSelectResizeDragRef.current;

  if (dragState) {
    const box = vectorMultiSelectBoxRef.current;

    if (box) {
      vectorMultiSelectBoxRef.current = { ...box, bounds: dragState.liveBounds };
    }

    vectorMultiSelectResizeDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = '';
  }
};
