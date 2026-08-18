import { RefObject } from 'react';

// types
import { TEllipseArcRatioDragState } from 'types/design/canvas/types';

// utils
import { disarmSimpleDrag } from './disarmSimpleDrag';

export const disarmEllipseArcRatioDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  ellipseArcRatioDragRef: RefObject<TEllipseArcRatioDragState | null>,
): void => disarmSimpleDrag(canvas, event, ellipseArcRatioDragRef);
