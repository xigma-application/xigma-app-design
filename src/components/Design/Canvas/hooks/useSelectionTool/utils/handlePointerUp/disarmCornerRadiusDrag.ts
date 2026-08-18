import { RefObject } from 'react';

// types
import { TCornerRadiusDragState } from 'types/design/canvas/types';

// utils
import { disarmSimpleDrag } from './disarmSimpleDrag';

export const disarmCornerRadiusDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  cornerRadiusDragRef: RefObject<TCornerRadiusDragState | null>,
): void => disarmSimpleDrag(canvas, event, cornerRadiusDragRef);
