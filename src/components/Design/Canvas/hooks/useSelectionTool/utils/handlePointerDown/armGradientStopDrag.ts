import { RefObject } from 'react';

// types
import { TGradientStopDragState } from 'types/design/canvas/types';

export const armGradientStopDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gradientStopDragRef: RefObject<TGradientStopDragState | null>,
  nodeId: string,
  paintIndex: number,
  stopIndex: number,
  color: string,
  opacity: number,
): void => {
  gradientStopDragRef.current = { color, draggedStopIndex: stopIndex, nodeId, opacity, paintIndex };
  canvas.setPointerCapture(event.pointerId);
};
