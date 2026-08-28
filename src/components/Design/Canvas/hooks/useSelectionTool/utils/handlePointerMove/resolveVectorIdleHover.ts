// types
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { resolveVectorCutHover } from './resolveVectorCutHover';
import { resolveVectorCutMarkConsumption } from './resolveVectorCutMarkConsumption';
import { resolveVectorEraseHover } from './resolveVectorEraseHover';
import { resolveVectorFaceSelectHover } from './resolveVectorFaceSelectHover';
import { resolveVectorMultiSelectBoxHover } from './resolveVectorMultiSelectBoxHover';
import { resolveVectorPaintHover } from './resolveVectorPaintHover';
import { resolveVectorSegmentHover } from './resolveVectorSegmentHover/resolveVectorSegmentHover';
import { resolveVectorTangentHandleHover } from './resolveVectorTangentHandleHover';
import { resolveVectorVertexHover } from './resolveVectorVertexHover';

const isVectorMultiSelectBoxDragActive = (canvasRefs: TCanvasRefs): boolean =>
  Boolean(
    canvasRefs.vectorMultiSelect.vectorMultiSelectResizeDragRef.current ||
    canvasRefs.vectorMultiSelect.vectorMultiSelectRotateDragRef.current ||
    canvasRefs.vectorMultiSelect.vectorMultiDragRef.current,
  );

export const resolveVectorIdleHover = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  setClassName: (className: string | null) => void,
): void => {
  if (!isVectorMultiSelectBoxDragActive(canvasRefs)) {
    resolveVectorVertexHover(canvas, event, canvasRefs.hover.hoveredVectorVertexIdRef);
    resolveVectorTangentHandleHover(canvas, event, canvasRefs);
    resolveVectorSegmentHover(
      canvas,
      event,
      canvasRefs.hover.hoveredVectorSegmentIdRef,
      canvasRefs.hover.hoveredVectorEdgeInsertPointRef,
      setClassName,
    );
    resolveVectorPaintHover(canvas, event, canvasRefs, setClassName);
    resolveVectorFaceSelectHover(canvas, event, canvasRefs);
    resolveVectorMultiSelectBoxHover(canvas, event, canvasRefs, setClassName);
    resolveVectorCutHover(canvas, event, canvasRefs, setClassName);
    resolveVectorEraseHover(canvas, event, canvasRefs, setClassName);
    resolveVectorCutMarkConsumption(canvasRefs);
  }
};
