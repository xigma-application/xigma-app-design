import { RefObject } from 'react';

// types
import { TStarRatioDragState } from 'types/design/selectionTool/types';

// utils
import { disarmSimpleDrag } from './disarmSimpleDrag';

export const disarmStarRatioDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  starRatioDragRef: RefObject<TStarRatioDragState | null>,
): void => disarmSimpleDrag(canvas, event, starRatioDragRef);
