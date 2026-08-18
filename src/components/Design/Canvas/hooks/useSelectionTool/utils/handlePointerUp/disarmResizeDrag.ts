import { RefObject } from 'react';

// types
import { TResizeDragState } from 'types/design/selectionTool/types';

// utils
import { disarmSimpleDrag } from './disarmSimpleDrag';

export const disarmResizeDrag = (canvas: HTMLCanvasElement, event: PointerEvent, resizeDragRef: RefObject<TResizeDragState | null>): void =>
  disarmSimpleDrag(canvas, event, resizeDragRef);
