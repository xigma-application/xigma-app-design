// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const disarmVectorMultiSelectRotateDrag = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs): void => {
  const dragState = canvasRefs.vectorMultiSelect.vectorMultiSelectRotateDragRef.current;

  if (dragState) {
    const box = canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current;

    if (box) {
      canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current = { ...box, rotation: dragState.rotation + dragState.deltaDegrees };
    }

    canvasRefs.vectorMultiSelect.vectorMultiSelectRotateDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = '';
  }
};
