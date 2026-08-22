// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { resolveVectorMultiSelectBoxHover } from './resolveVectorMultiSelectBoxHover';
import { resolveVectorPaintHover } from './resolveVectorPaintHover';
import { resolveVectorSegmentHover } from './resolveVectorSegmentHover/resolveVectorSegmentHover';
import { resolveVectorTangentHandleHover } from './resolveVectorTangentHandleHover';
import { resolveVectorVertexHover } from './resolveVectorVertexHover';

const isVectorMultiSelectBoxDragActive = (canvasRefs: TCanvasRefs): boolean =>
  Boolean(
    canvasRefs.vectorMultiSelectResizeDragRef.current ||
    canvasRefs.vectorMultiSelectRotateDragRef.current ||
    canvasRefs.vectorMultiDragRef.current,
  );

export const resolveVectorIdleHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  if (!isVectorMultiSelectBoxDragActive(canvasRefs)) {
    resolveVectorVertexHover(canvas, event, canvasRefs.hoveredVectorVertexIdRef);
    resolveVectorTangentHandleHover(canvas, event, canvasRefs);
    resolveVectorSegmentHover(
      canvas,
      event,
      canvasRefs.hoveredVectorSegmentIdRef,
      canvasRefs.hoveredVectorEdgeInsertPointRef,
      setClassName,
    );
    resolveVectorPaintHover(canvas, event, canvasRefs, setClassName);
    resolveVectorMultiSelectBoxHover(canvas, event, canvasRefs, setClassName);
  }
};
