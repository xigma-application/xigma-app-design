import { RefObject } from 'react';

// types
import { TPathOffsetDragState } from '../../types';

export const armPathOffsetDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  pathOffsetDragRef: RefObject<TPathOffsetDragState | null>,
  nodeId: string,
): void => {
  pathOffsetDragRef.current = { nodeId };
  canvas.setPointerCapture(event.pointerId);
};
