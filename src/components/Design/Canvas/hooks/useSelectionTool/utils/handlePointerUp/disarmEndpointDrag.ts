import { RefObject } from 'react';

// types
import { TEndpointDragState } from 'types/design/selectionTool/types';

// utils
import { disarmSimpleDrag } from './disarmSimpleDrag';

export const disarmEndpointDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  endpointDragRef: RefObject<TEndpointDragState | null>,
): void => disarmSimpleDrag(canvas, event, endpointDragRef);
