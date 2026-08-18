import { RefObject } from 'react';

// types
import { TStarCornerRadiusDragState } from 'types/design/canvas/types';

// utils
import { disarmSimpleDrag } from './disarmSimpleDrag';

export const disarmStarCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  starCornerRadiusDragRef: RefObject<TStarCornerRadiusDragState | null>,
): void => disarmSimpleDrag(canvas, event, starCornerRadiusDragRef);
