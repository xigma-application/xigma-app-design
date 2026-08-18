import { RefObject } from 'react';

// types
import { TEllipseArcRotateDragState } from 'types/design/canvas/types';

// utils
import { disarmSimpleDrag } from './disarmSimpleDrag';

export const disarmEllipseArcRotateDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  ellipseArcRotateDragRef: RefObject<TEllipseArcRotateDragState | null>,
): void => disarmSimpleDrag(canvas, event, ellipseArcRotateDragRef);
