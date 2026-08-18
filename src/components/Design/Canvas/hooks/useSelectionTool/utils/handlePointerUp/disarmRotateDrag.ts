import { RefObject } from 'react';

// types
import { TRotateDragState } from 'types/design/selectionTool/types';

// utils
import { disarmSimpleDrag } from './disarmSimpleDrag';

export const disarmRotateDrag = (canvas: HTMLCanvasElement, event: PointerEvent, rotateDragRef: RefObject<TRotateDragState | null>): void =>
  disarmSimpleDrag(canvas, event, rotateDragRef);
