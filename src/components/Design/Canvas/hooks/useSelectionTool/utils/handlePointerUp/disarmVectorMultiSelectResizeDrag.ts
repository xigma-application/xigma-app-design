// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const disarmVectorMultiSelectResizeDrag = (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs): void => {
  const dragState = canvasRefs.vectorMultiSelect.vectorMultiSelectResizeDragRef.current;

  if (dragState) {
    const box = canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current;

    if (box) {
      canvasRefs.vectorMultiSelect.vectorMultiSelectBoxRef.current = { ...box, bounds: dragState.liveBounds };
    }

    canvasRefs.vectorMultiSelect.vectorMultiSelectResizeDragRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    canvas.style.cursor = '';
  }
};
