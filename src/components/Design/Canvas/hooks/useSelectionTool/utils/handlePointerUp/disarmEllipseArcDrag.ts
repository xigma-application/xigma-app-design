import { RefObject } from 'react';

// types
import { TEllipseArcDragState } from 'types/design/canvas/types';

// utils
import { disarmSimpleDrag } from './disarmSimpleDrag';

export const disarmEllipseArcDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  ellipseArcDragRef: RefObject<TEllipseArcDragState | null>,
): void => disarmSimpleDrag(canvas, event, ellipseArcDragRef);
