import { RefObject } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorMarqueeMode } from 'types/design/selectionTool/types';

export const disarmVectorMarqueeDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  vectorMarqueeStartRef: RefObject<TPoint | null>,
  vectorMarqueeModeRef: RefObject<TVectorMarqueeMode | null>,
): void => {
  if (vectorMarqueeStartRef.current) {
    vectorMarqueeStartRef.current = null;
    vectorMarqueeModeRef.current = null;
    canvasRefs.lassoMarquee.marqueeRef.current = null;
    canvasRefs.vectorEdit.preVectorMarqueeVertexIdsRef.current = [];
    canvasRefs.vectorEdit.preVectorMarqueeSegmentIdsRef.current = [];
    canvas.releasePointerCapture(event.pointerId);
  }
};
