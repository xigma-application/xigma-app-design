import { RefObject } from 'react';

// types
import { TGradientRadiusDragState } from 'types/design/canvas/types';

export const armGradientRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gradientRadiusDragRef: RefObject<TGradientRadiusDragState | null>,
  nodeId: string,
  paintIndex: number,
): void => {
  gradientRadiusDragRef.current = { nodeId, paintIndex };
  canvas.setPointerCapture(event.pointerId);
};
