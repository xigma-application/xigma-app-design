import { RefObject } from 'react';

// types
import { TEndpointDragState, TLineEndpoint } from 'types/design/selectionTool/types';

// utils
import { armEndpointDrag } from './armEndpointDrag';

export const armLineEndpointDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  endpointDragRef: RefObject<TEndpointDragState | null>,
  nodeId: string,
  endpoint: TLineEndpoint,
): void => {
  armEndpointDrag(nodeId, endpoint, endpointDragRef);
  canvas.setPointerCapture(event.pointerId);
};
