import { RefObject } from 'react';

// types
import { TGradientEndpointMoveDragState, TGradientRotateEndpoint } from 'types/design/canvas/types';

export const armGradientEndpointMoveDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gradientEndpointMoveDragRef: RefObject<TGradientEndpointMoveDragState | null>,
  nodeId: string,
  paintIndex: number,
  endpoint: TGradientRotateEndpoint,
): void => {
  gradientEndpointMoveDragRef.current = { endpoint, nodeId, paintIndex };
  canvas.setPointerCapture(event.pointerId);
};
