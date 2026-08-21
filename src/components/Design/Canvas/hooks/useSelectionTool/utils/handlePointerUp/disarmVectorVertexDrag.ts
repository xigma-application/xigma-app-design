// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

export const disarmVectorVertexDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  setClassName: (className: string | null) => void,
): void => {
  if (selectionRefs.vectorVertexDragRef.current) {
    canvas.releasePointerCapture(event.pointerId);
    selectionRefs.vectorVertexDragRef.current = null;
    canvasRefs.vectorAlignmentGuideRef.current = null;
    setClassName(null);
  }
};
