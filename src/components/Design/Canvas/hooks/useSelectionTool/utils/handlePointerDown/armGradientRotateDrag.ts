import { RefObject } from 'react';

// types
import { TGradientRotateDragState, TGradientRotateEndpoint } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export const armGradientRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gradientRotateDragRef: RefObject<TGradientRotateDragState | null>,
  nodeId: string,
  paintIndex: number,
  endpoint: TGradientRotateEndpoint,
  pointerPosition: TPoint,
): void => {
  gradientRotateDragRef.current = { draggedEndpoint: endpoint, nodeId, paintIndex, pointerPosition };
  canvas.setPointerCapture(event.pointerId);
};
