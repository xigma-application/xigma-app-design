import { RefObject } from 'react';

// types
import { TGradientRotateDragState, TGradientRotateEndpoint, TGradientRotateMode } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

export const armGradientRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gradientRotateDragRef: RefObject<TGradientRotateDragState | null>,
  nodeId: string,
  paintIndex: number,
  endpoint: TGradientRotateEndpoint,
  pointerPosition: TPoint,
  mode: TGradientRotateMode,
  pivot: TPoint,
  radius: number,
  angleOffset: number,
): void => {
  gradientRotateDragRef.current = { angleOffset, draggedEndpoint: endpoint, mode, nodeId, paintIndex, pivot, pointerPosition, radius };
  canvas.setPointerCapture(event.pointerId);
};
